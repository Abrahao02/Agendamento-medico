// src/pages/AllAppointments/AllAppointments.jsx
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebase/config";
import { useNavigate } from "react-router-dom";

import useAllAppointments from "../hooks/agenda/useAllAppointments";
import Filters from "../components/common/Filters/Filters";
import PatientsList from "../components/allAppointments/PatientsList";
import SaveChangesBar from "../components/allAppointments/SaveChangesBar";
import LoadingFallback from "../components/common/LoadingFallback/LoadingFallback";

import "./AllAppointments.css";

export default function AllAppointments() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const {
    patientsData,
    loadingData,

    // Filters
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

    // UI
    expandedPatients,
    togglePatient,
    toggleAll,

    // Save
    changedIds,
    saving,
    handleStatusChange,
    handleSave,

    // Stats
    stats,
  } = useAllAppointments(user);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  if (loading || loadingData) {
    return <LoadingFallback message="Carregando agendamentos..." />;
  }

  const statusOptions = [
    { value: "Confirmado", label: "Confirmado" },
    { value: "Pendente", label: "Pendente" },
    { value: "Não Compareceu", label: "Não Compareceu" },
    { value: "Msg enviada", label: "Msg enviada" },
  ];

  const extraActions = (
    <>
      <button className="btn btn-ghost" onClick={() => toggleAll(true)}>
        Expandir Todos
      </button>
      <button className="btn btn-ghost" onClick={() => toggleAll(false)}>
        Contrair Todos
      </button>
    </>
  );

  return (
    <div className="appointments-page">
      <div className="appointments-container">
        <header className="page-header">
          <h2>Todos os Agendamentos</h2>
          <p>
            {stats.totalAppointments} agendamento(s) •{" "}
            <strong>R$ {stats.totalValue.toFixed(2)}</strong> • Pacientes:{" "}
            <strong>{stats.totalPatients}</strong>
          </p>
        </header>

        <Filters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nome ou telefone..."
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={statusOptions}
          dateFrom={startDate}
          dateTo={endDate}
          onDateFromChange={setStartDate}
          onDateToChange={setEndDate}
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          availableYears={availableYears}
          onReset={resetFilters}
          extraActions={extraActions}
          showSearch
          showStatus
          showDateRange
          showMonthYear
        />

        <PatientsList
          patientsData={patientsData}
          expandedPatients={expandedPatients}
          changedIds={changedIds}
          onTogglePatient={togglePatient}
          onStatusChange={handleStatusChange}
        />

        <SaveChangesBar
          changesCount={changedIds.size}
          saving={saving}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
