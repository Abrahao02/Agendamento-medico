// src/hooks/useAllAppointments.js
import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "../../services/firebase/config";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { filterAppointments, sortAppointments } from "../../utils/filters/appointmentFilters";
import { groupAppointmentsByPatient } from "../../utils/filters/patientGrouping";
import { generateYearRange } from "../../utils/helpers/yearHelpers";

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
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
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

  const handleStatusChange = useCallback((id, newStatus) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
    setChangedIds((prev) => new Set([...prev, id]));
  }, []);

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
  };
}
