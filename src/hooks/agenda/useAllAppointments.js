// src/hooks/useAllAppointments.js
import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "../../services/firebase/config";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { filterAppointments, sortAppointments } from "../../utils/filters/appointmentFilters";
import { groupAppointmentsByPatient } from "../../utils/filters/patientGrouping";
import { generateYearRange } from "../../utils/helpers/yearHelpers";
import { STATUS_GROUPS } from "../../constants/appointmentStatus";

export default function useAllAppointments(user) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // STATE
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [expandedPatients, setExpandedPatients] = useState(new Set());
  const [changedIds, setChangedIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [lockedAppointments, setLockedAppointments] = useState(new Set()); // ✅ NOVO

  // ✅ NOVA FUNÇÃO: Identifica appointments bloqueados
  const identifyLockedAppointments = useCallback((appointmentsList) => {
    const locked = new Set();

    // Agrupa appointments por data+horário
    const slotMap = new Map();
    
    appointmentsList.forEach((appt) => {
      const slotKey = `${appt.date}_${appt.time}`;
      
      if (!slotMap.has(slotKey)) {
        slotMap.set(slotKey, []);
      }
      slotMap.get(slotKey).push(appt);
    });

    // Para cada slot, verifica se há appointments bloqueados
    slotMap.forEach((appointmentsInSlot) => {
      // Se houver pelo menos um appointment ATIVO no slot
      const hasActiveInSlot = appointmentsInSlot.some(
        appt => STATUS_GROUPS.ACTIVE.includes(appt.status)
      );

      if (hasActiveInSlot) {
        // Bloqueia todos os appointments INATIVOS deste slot
        appointmentsInSlot.forEach((appt) => {
          if (!STATUS_GROUPS.ACTIVE.includes(appt.status)) {
            locked.add(appt.id);
          }
        });
      }
    });

    setLockedAppointments(locked);
  }, []);

  // FETCH
  useEffect(() => {
    if (!user) return;

    const fetchAppointments = async () => {
      setLoadingData(true);
      try {
        const q = query(
          collection(db, "appointments"),
          where("doctorId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        const sorted = sortAppointments(data);
        setAppointments(sorted);
        
        // ✅ Identifica appointments bloqueados após carregar
        identifyLockedAppointments(sorted);
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAppointments();
  }, [user, identifyLockedAppointments]);

  // FILTRO PRINCIPAL
  const filteredAppointments = useMemo(() => {
    return filterAppointments(appointments, {
      statusFilter,
      searchTerm,
      startDate,
      endDate,
      selectedMonth,
      selectedYear,
    });
  }, [appointments, statusFilter, searchTerm, startDate, endDate, selectedMonth, selectedYear]);

  // AGRUPA POR PACIENTE
  const patientsData = useMemo(() => {
    return groupAppointmentsByPatient(filteredAppointments);
  }, [filteredAppointments]);

  // AÇÕES
  const togglePatient = useCallback((patient) => {
    setExpandedPatients((prev) => {
      const newSet = new Set(prev);
      newSet.has(patient) ? newSet.delete(patient) : newSet.add(patient);
      return newSet;
    });
  }, []);

  const toggleAll = useCallback(
    (expand) => {
      if (expand) {
        setExpandedPatients(new Set(patientsData.map((p) => p.name)));
      } else {
        setExpandedPatients(new Set());
      }
    },
    [patientsData]
  );

  // ✅ ATUALIZADO: handleStatusChange com validação de locked
  const handleStatusChange = useCallback((id, newStatus) => {
    // ❌ Bloqueia se o appointment está travado
    if (lockedAppointments.has(id)) {
      console.warn("⚠️ Este agendamento não pode ter o status alterado pois o horário já foi reagendado");
      alert("⚠️ Este horário já foi reagendado. O status não pode ser alterado.");
      return;
    }

    const currentAppointment = appointments.find(a => a.id === id);
    
    // ✅ Se está mudando PARA cancelado/não compareceu, verifica conflito
    if (!STATUS_GROUPS.ACTIVE.includes(newStatus)) {
      const hasActiveInSameSlot = appointments.some(
        other => 
          other.id !== id &&
          other.date === currentAppointment.date &&
          other.time === currentAppointment.time &&
          STATUS_GROUPS.ACTIVE.includes(other.status)
      );

      if (hasActiveInSameSlot) {
        console.warn("⚠️ Não é possível cancelar: horário já foi reagendado");
        alert("⚠️ Este horário já foi reagendado. Não é possível cancelar.");
        return;
      }
    }

    // ✅ Atualização permitida
    setAppointments((prev) => {
      const updated = prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app));
      
      // ✅ Recalcula appointments bloqueados após atualização
      identifyLockedAppointments(updated);
      
      return updated;
    });
    
    setChangedIds((prev) => new Set([...prev, id]));
  }, [appointments, lockedAppointments, identifyLockedAppointments]);

  // ✅ NOVA FUNÇÃO: Verifica se appointment está bloqueado
  const isAppointmentLocked = useCallback((appointmentId) => {
    return lockedAppointments.has(appointmentId);
  }, [lockedAppointments]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = appointments
        .filter((app) => changedIds.has(app.id))
        .map((app) => updateDoc(doc(db, "appointments", app.id), { status: app.status }));

      await Promise.all(updates);
      setChangedIds(new Set());
      alert("✅ Alterações salvas com sucesso!");
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = useCallback(() => {
    setStatusFilter("Todos");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  }, [currentMonth, currentYear]);

  // STATS
  const stats = useMemo(() => {
    const totalAppointments = filteredAppointments.length;
    const totalValue = filteredAppointments.reduce((sum, app) => sum + (app.value || 0), 0);
    const totalPatients = patientsData.length;
    return { totalAppointments, totalValue, totalPatients };
  }, [filteredAppointments, patientsData]);

  const availableYears = useMemo(() => generateYearRange(1), []);

  return {
    loadingData,
    patientsData,
    appointments,
    statusFilter,
    searchTerm,
    startDate,
    endDate,
    selectedMonth,
    selectedYear,
    setStatusFilter,
    setSearchTerm,
    setStartDate,
    setEndDate,
    setSelectedMonth,
    setSelectedYear,
    resetFilters,
    availableYears,
    expandedPatients,
    togglePatient,
    toggleAll,
    changedIds,
    saving,
    handleStatusChange,
    handleSave,
    stats,
    lockedAppointments, // ✅ NOVO
    isAppointmentLocked, // ✅ NOVO
  };
}