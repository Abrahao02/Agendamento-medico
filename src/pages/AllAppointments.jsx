import React, { useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { auth } from "../services/firebase/config";

import useAllAppointments from "../hooks/agenda/useAllAppointments";
import PageHeader from "../components/common/PageHeader";
import Filters from "../components/common/Filters";
import Button from "../components/common/Button";
import PatientsList from "../components/allAppointments/PatientsList";
import SaveChangesBar from "../components/allAppointments/SaveChangesBar";
import LoadingFallback from "../components/common/LoadingFallback";
import LimitWarningBanner from "../components/common/LimitWarningBanner";
import { getStatusOptions } from "../utils/appointments/getStatusOptions";
import { sendWhatsappMessage } from "../utils/whatsapp/generateWhatsappLink";
import { formatCurrency } from "../utils/formatter/formatCurrency";

import "./AllAppointments.css";

export default function AllAppointments() {
  const user = auth.currentUser;
  const { isLimitReached } = useOutletContext() || {};

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

  // ✅ IMPORTANTE: Todos os Hooks devem ser chamados antes de qualquer return condicional
  const statusOptions = getStatusOptions(true);

  const handleSendWhatsapp = useCallback((number, text) => {
    sendWhatsappMessage(number, text);
  }, []);

  // Return condicional APÓS todos os Hooks
  if (loadingData) {
    return <LoadingFallback message="Carregando agendamentos..." />;
  }

  const extraActions = (
    <>
      <Button variant="ghost" onClick={() => toggleAll(true)}>
        Expandir Todos
      </Button>
      <Button variant="ghost" onClick={() => toggleAll(false)}>
        Contrair Todos
      </Button>
    </>
  );

  return (
    <div className="appointments-page">
      <div className="appointments-container">
        <PageHeader
          label="Gestão de Agendamentos"
          title="Todos os Agendamentos"
          description={`${stats.totalAppointments} agendamento(s) • ${formatCurrency(stats.totalValue)} • Pacientes: ${stats.totalPatients}`}
        />

        {isLimitReached && <LimitWarningBanner />}

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
          onSendWhatsapp={handleSendWhatsapp}
        />

        <SaveChangesBar changesCount={changedIds.size} saving={saving} onSave={handleSave} />
      </div>
    </div>
  );
}