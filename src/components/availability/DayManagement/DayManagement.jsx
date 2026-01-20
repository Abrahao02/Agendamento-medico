import { CalendarDays } from "lucide-react";
import SlotItem from "../SlotItem";
import SlotForm from "../SlotForm";
import DayStats from "../DayStats";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import { getAppointmentTypeOptions } from "../../../constants/appointmentType";
import { normalizeTo24Hour } from "../../../utils/time/normalizeTime";
import { formatCurrency } from "../../../utils/formatter/formatCurrency";
import { useDayManagement } from "../../../hooks/appointments/useDayManagement";
import "./DayManagement.css";

export default function DayManagement({
  formattedDate,
  // Props agrupadas (ISP)
  slots = null,
  context = null,
  handlers: externalHandlers = null,
  // Props individuais (compatibilidade)
  allSlots,
  appointments,
  patients,
  doctor,
  onAddSlot,
  onRemoveSlot,
  onBookAppointment,
  onDeleteAppointment,
  onMarkAsCancelled,
  isLimitReached = false,
}) {
  // Extrair valores das props agrupadas ou usar valores individuais (compatibilidade)
  const finalAllSlots = slots?.all || allSlots;
  const finalAppointments = context?.appointments || appointments;
  const finalPatients = context?.patients || patients;
  const finalDoctor = context?.doctor || doctor;
  const finalIsLimitReached = context?.isLimitReached ?? isLimitReached;

  const finalOnAddSlot = externalHandlers?.onAddSlot || onAddSlot;
  const finalOnRemoveSlot = externalHandlers?.onRemoveSlot || onRemoveSlot;
  const finalOnBookAppointment = externalHandlers?.onBookAppointment || onBookAppointment;
  const finalOnDeleteAppointment = externalHandlers?.onDeleteAppointment || onDeleteAppointment;
  const finalOnMarkAsCancelled = externalHandlers?.onMarkAsCancelled || onMarkAsCancelled;

  const {
    state,
    refs,
    data,
    handlers,
  } = useDayManagement({
    allSlots: finalAllSlots,
    appointments: finalAppointments,
    patients: finalPatients,
    doctor: finalDoctor,
    onAddSlot: finalOnAddSlot,
    onRemoveSlot: finalOnRemoveSlot,
    onBookAppointment: finalOnBookAppointment,
    onDeleteAppointment: finalOnDeleteAppointment,
    onMarkAsCancelled: finalOnMarkAsCancelled,
    isLimitReached: finalIsLimitReached,
  });

  return (
    <div className="day-slots-card">
      <h3>
        <CalendarDays size={20} /> DIA {formattedDate}
      </h3>

      <DayStats 
        confirmedCount={data.dayStats.confirmed}
        pendingCount={data.dayStats.pending}
        occupancyRate={data.dayStats.occupancyRate}
        activeCount={data.activeAppointments.length}
        totalSlots={data.combinedSlots.length}
      />

      <div className="slots-list">
        {data.combinedSlots.length === 0 ? (
          <p className="empty-message">Nenhum horário cadastrado</p>
        ) : (
          data.combinedSlots.map((slotTime, i) => {
            // Find the original slot object if it exists in allSlots
            const originalSlot = finalAllSlots.find(slot => {
              const time = typeof slot === "string" ? slot : (slot?.time || null);
              return time === slotTime;
            }) || slotTime;
            
            const appointment = handlers.getAppointmentBySlot(slotTime);
            let displayName = null;

            if (appointment) {
              const patient = finalPatients.find((p) => p.id === appointment.patientId);
              displayName = patient?.referenceName || appointment.patientName;
            }

            return (
              <SlotItem
                key={i}
                slot={slotTime}
                slotData={originalSlot}
                isBooked={!!appointment}
                patientName={displayName}
                status={appointment?.status}
                appointment={appointment}
                onRemove={() => handlers.handleRemoveSlot(originalSlot)}
                onDelete={() => handlers.handleOpenModal(slotTime)}
                doctor={finalDoctor}
              />
            );
          })
        )}
      </div>

      <div className="mode-toggle">
        <button
          className={state.mode === "add" ? "active" : ""}
          onClick={() => {
            handlers.setMode("add");
            handlers.setError("");
          }}
        >
          Adicionar Horário
        </button>
        <button
          className={state.mode === "book" ? "active" : ""}
          onClick={() => {
            handlers.setMode("book");
            handlers.setError("");
            if (!state.selectedTime) {
              handlers.setSelectedTime("12:00");
            }
          }}
        >
          Marcar Consulta
        </button>
      </div>

      {/* eslint-disable-next-line react-hooks/refs */}
      <div ref={refs.formSectionRef}>
        {state.mode === "add" && (
          <SlotForm
            time={state.slotTime}
            onTimeChange={handlers.setSlotTime}
            appointmentType={state.slotAppointmentType}
            onAppointmentTypeChange={handlers.setSlotAppointmentType}
            selectedLocationIds={state.slotLocationIds}
            onLocationIdsChange={handlers.setSlotLocationIds}
            locations={data.locations}
            appointmentTypeConfig={data.appointmentTypeConfig}
            onSubmit={handlers.handleAddSlotSubmit}
            loading={state.loading || finalIsLimitReached}
            error={state.error}
          />
        )}

        {state.mode === "book" && (
          <div className="book-slot">
            <select
              value={state.selectedPatient}
              onChange={(e) => handlers.setSelectedPatient(e.target.value)}
              disabled={state.loading || finalIsLimitReached}
              title={finalIsLimitReached ? "Limite do plano atingido" : ""}
            >
              <option value="">Selecione o paciente</option>
              {data.sortedPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.referenceName || p.name} — R$ {p.price || 0}
                </option>
              ))}
            </select>

            {data.showAppointmentType && !data.isFixed && (
              <select
                value={state.bookAppointmentType}
                onChange={(e) => {
                  handlers.setBookAppointmentType(e.target.value);
                  handlers.setBookLocationId("");
                }}
                disabled={state.loading || finalIsLimitReached}
                title={finalIsLimitReached ? "Limite do plano atingido" : ""}
              >
                {getAppointmentTypeOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {data.showLocationSelector && (
              <select
                value={state.bookLocationId}
                onChange={(e) => handlers.setBookLocationId(e.target.value)}
                disabled={state.loading || finalIsLimitReached || data.locations.length === 1}
                required={data.requiresLocation}
                title={finalIsLimitReached ? "Limite do plano atingido" : ""}
              >
                <option value="">Selecione um local</option>
                {data.locations.map((location, index) => (
                  <option key={location.name || `location-${index}`} value={location.name}>
                    {location.name}
                    {location.defaultValue > 0 && ` - ${formatCurrency(location.defaultValue)}`}
                  </option>
                ))}
              </select>
            )}

            <label className="book-slot-deal-toggle">
              <input
                type="checkbox"
                checked={state.priceMode === "deal"}
                onChange={(e) => {
                  if (e.target.checked) {
                    handlers.setPriceMode("deal");
                  } else {
                    handlers.setPriceMode("patient");
                    handlers.setDealValue("");
                  }
                }}
                disabled={state.loading || finalIsLimitReached}
              />
              <span>Acordo (definir valor diferente do padrão)</span>
            </label>

            {state.priceMode === "deal" && (
              <input
                type="number"
                min="0"
                step="0.01"
                value={state.dealValue}
                onChange={(e) => handlers.setDealValue(e.target.value)}
                disabled={state.loading || finalIsLimitReached}
                placeholder="0,00"
                className="book-slot-price-input"
                title={finalIsLimitReached ? "Limite do plano atingido" : "Informe o valor do acordo"}
              />
            )}

            <input
              type="time"
              value={state.selectedTime}
              onChange={(e) => {
                const normalizedTime = normalizeTo24Hour(e.target.value);
                handlers.setSelectedTime(normalizedTime);
              }}
              disabled={state.loading || finalIsLimitReached}
              min="00:00"
              max="23:59"
              step="60"
              lang="pt-BR"
              className="book-slot-time-input"
              placeholder="Selecione o horário"
              title={finalIsLimitReached ? "Limite do plano atingido" : "Selecione o horário"}
              data-format="24"
            />

            <button 
              onClick={handlers.handleBookAppointment} 
              disabled={state.loading || finalIsLimitReached} 
              title={finalIsLimitReached ? "Limite do plano atingido" : ""}
            >
              {state.loading ? "Confirmando..." : "Confirmar"}
            </button>
          </div>
        )}
      </div>

      {state.error && <p className="error-message">{state.error}</p>}

      <DeleteConfirmationModal
        isOpen={state.modalOpen}
        onClose={() => {
          handlers.setModalOpen(false);
          handlers.setSelectedAppointment(null);
        }}
        onConfirmDelete={handlers.handleConfirmDelete}
        onConfirmCancel={handlers.handleConfirmCancel}
        patientName={state.selectedAppointment?.displayName}
        time={state.selectedAppointment?.time}
        loading={state.loading}
      />
    </div>
  );
}
