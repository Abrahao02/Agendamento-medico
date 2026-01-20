// src/hooks/useAllAppointments.js
import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "../../services/firebase/config";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { filterAppointments, sortAppointments } from "../../utils/filters/appointmentFilters";
import { groupAppointmentsByPatient } from "../../utils/filters/patientGrouping";
import { generateYearRange } from "../../utils/helpers/yearHelpers";
import { STATUS_GROUPS } from "../../constants/appointmentStatus";
import { PatientService } from "../../services/firebase";
import { subscribeToPatients } from "../../services/firebase/patients.service";
import { canChangeAppointmentStatus, getLockedAppointmentIds } from "../../utils/appointments/lockedAppointments";
import { logError, logWarning } from "../../utils/logger/logger";
import { useToast } from "../../components/common/Toast";

export default function useAllAppointments(user) {
  const toast = useToast();
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // STATE
  const [appointments, setAppointments] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});
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
  const [lockedAppointments, setLockedAppointments] = useState(new Set());

  const identifyLockedAppointments = useCallback((appointmentsList) => {
    setLockedAppointments(getLockedAppointmentIds(appointmentsList));
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToPatients(user.uid, (patientsResult) => {
      if (patientsResult.success) {
        // Criar mapa de WhatsApp -> Nome atualizado
        const map = {};
        patientsResult.data.forEach((patient) => {
          // Usar referenceName se existir, senão usar name
          const displayName = patient.referenceName?.trim() || patient.name;
          map[patient.whatsapp] = displayName;
        });
        
        setPatientsMap(map);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user]);

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
        
        identifyLockedAppointments(sorted);
      } catch (err) {
        logError("Erro ao buscar agendamentos:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAppointments();
  }, [user]);

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

  const patientsData = useMemo(() => {
    const grouped = groupAppointmentsByPatient(filteredAppointments);
    
    return grouped.map((patient) => {
      const updatedName = patientsMap[patient.whatsapp];
      if (updatedName) {
        return {
          ...patient,
          name: updatedName,
        };
      }
      return patient;
    });
  }, [filteredAppointments, patientsMap]);

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

  const handleStatusChange = useCallback((id, newStatus) => {
    // Bloqueia se o appointment está travado
    if (lockedAppointments.has(id)) {
      logWarning("Este agendamento não pode ter o status alterado pois o horário já foi reagendado");
      toast.info("Este horário já foi reagendado. O status não pode ser alterado.");
      return;
    }

    const statusCheck = canChangeAppointmentStatus(appointments, id, newStatus);
    if (!statusCheck.allowed) {
      logWarning(statusCheck.error);
      toast.error(statusCheck.error);
      return;
    }

    setAppointments((prev) => {
      const updated = prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app));
      
      identifyLockedAppointments(updated);
      
      return updated;
    });
    
    setChangedIds((prev) => new Set([...prev, id]));
  }, [appointments, lockedAppointments, identifyLockedAppointments, toast]);

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
      toast.success("Alterações salvas com sucesso!");
    } catch (err) {
      logError("Erro ao atualizar status:", err);
      toast.error("Erro ao salvar alterações.");
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
    lockedAppointments,
    isAppointmentLocked,
  };
}