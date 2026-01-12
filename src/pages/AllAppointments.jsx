import React from "react";
import { auth } from "../services/firebase/config";

import useAllAppointments from "../hooks/agenda/useAllAppointments";
import Filters from "../components/common/Filters/Filters";
import PatientsList from "../components/allAppointments/PatientsList";
import SaveChangesBar from "../components/allAppointments/SaveChangesBar";
import LoadingFallback from "../components/common/LoadingFallback/LoadingFallback";
import { getStatusOptions } from "../utils/appointments/getStatusOptions";

import "./AllAppointments.css";

export default function AllAppointments() {
  const user = auth.currentUser;

  const {
    patientsData,
    loadingData,
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
  } = useAllAppointments(user);

  if (loadingData) {
    return <LoadingFallback message="Carregando agendamentos..." />;
  }

  const statusOptions = getStatusOptions(true);

  const sendWhatsapp = (number, text) => {
    const cleanNumber = number.replace(/\D/g, "");
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${cleanNumber}?text=${encodedText}`;
    window.open(url, "_blank");
  };

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
          lockedAppointments={lockedAppointments}
          onTogglePatient={togglePatient}
          onStatusChange={handleStatusChange}
          onSendWhatsapp={sendWhatsapp}
        />

        <SaveChangesBar changesCount={changedIds.size} saving={saving} onSave={handleSave} />
      </div>
    </div>
  );
}