import { useState, useMemo, useRef, useEffect } from "react";
import { FaCalendarDay } from "react-icons/fa";
import SlotItem from "../SlotItem/SlotItem";
import SlotForm from "../SlotForm/SlotForm";
import DayStats from "../DayStats/DayStats";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";
import { STATUS_GROUPS } from "../../../constants/appointmentStatus";
import { APPOINTMENT_TYPE, APPOINTMENT_TYPE_MODE, getAppointmentTypeOptions } from "../../../constants/appointmentType";
import { normalizeSlot } from "../../../utils/availability/normalizeSlot";
import { normalizeTo24Hour } from "../../../utils/time/normalizeTime";
import "./DayManagement.css";

export default function DayManagement({
  date,
  formattedDate,
  availableSlots,
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
  const [mode, setMode] = useState("add");
  const [slotTime, setSlotTime] = useState("12:00");
  const [slotAppointmentType, setSlotAppointmentType] = useState(APPOINTMENT_TYPE.ONLINE);
  const [slotLocationIds, setSlotLocationIds] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [bookAppointmentType, setBookAppointmentType] = useState(APPOINTMENT_TYPE.ONLINE);
  const [bookLocationId, setBookLocationId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const formSectionRef = useRef(null);

  useEffect(() => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [mode]);

  /* ==============================
     ✅ FILTRAR APENAS APPOINTMENTS ATIVOS
  ============================== */
  const activeAppointments = useMemo(() => {
    return appointments.filter(a => STATUS_GROUPS.ACTIVE.includes(a.status));
  }, [appointments]);

  // Get doctor config for location info
  const appointmentTypeConfig = doctor?.appointmentTypeConfig || {
    mode: APPOINTMENT_TYPE_MODE.DISABLED,
    fixedType: APPOINTMENT_TYPE.ONLINE,
    locations: [],
  };

  const locations = appointmentTypeConfig.locations || [];
  
  // Determine default appointment type
  useEffect(() => {
    if (appointmentTypeConfig.mode === APPOINTMENT_TYPE_MODE.FIXED) {
      setSlotAppointmentType(appointmentTypeConfig.fixedType);
      setBookAppointmentType(appointmentTypeConfig.fixedType);
    }
  }, [appointmentTypeConfig]);

  // Auto-select single location if only one exists
  useEffect(() => {
    if (bookAppointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length === 1) {
      if (!bookLocationId) {
        setBookLocationId(locations[0].name);
      }
    } else if (bookAppointmentType === APPOINTMENT_TYPE.ONLINE) {
      setBookLocationId("");
    }
  }, [bookAppointmentType, locations, bookLocationId]);

  // Determine if location is required/show location selector
  const showAppointmentType = appointmentTypeConfig.mode !== APPOINTMENT_TYPE_MODE.DISABLED;
  const isFixed = appointmentTypeConfig.mode === APPOINTMENT_TYPE_MODE.FIXED;
  const showLocationSelector = bookAppointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length > 0;
  const requiresLocation = bookAppointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length > 1;

  /* ==============================
     COMBINED SLOTS
     ✅ CORRIGIDO: Combina slots + TODOS os appointments (ativos e cancelados)
     Now handles both string and object slot formats
  ============================== */
  const combinedSlots = useMemo(() => {
    // Extract times from slots (handle both formats)
    const slotTimes = allSlots.map(slot => {
      if (typeof slot === "string") return slot;
      if (typeof slot === "object" && slot.time) return slot.time;
      return null;
    }).filter(Boolean);
    
    // ✅ MUDANÇA: Incluir TODOS os appointments (não apenas ativos)
    const allBookedTimes = appointments.map((a) => a.time);
    const combined = [...new Set([...slotTimes, ...allBookedTimes])];
    return combined.sort();
  }, [allSlots, appointments]);

  /* ==============================
     GET APPOINTMENT BY SLOT
     ✅ CORRIGIDO: Prioriza appointments ATIVOS
     Now handles both string and object slot formats
  ============================== */
  const getAppointmentBySlot = (slot) => {
    // Extract time from slot
    const slotTime = typeof slot === "string" ? slot : (slot?.time || null);
    if (!slotTime) return null;

    // Primeiro tenta encontrar um appointment ATIVO
    const active = appointments.find(a => 
      a.time === slotTime && STATUS_GROUPS.ACTIVE.includes(a.status)
    );
    
    // Se encontrou ativo, retorna ele
    if (active) return active;
    
    // Se não tem ativo, retorna cancelado (para mostrar histórico)
    return appointments.find(a => a.time === slotTime);
  };

  /* ==============================
     GET SLOT DISPLAY TEXT
     Handles both string and object formats
  ============================== */
  const getSlotDisplayText = (slot) => {
    if (typeof slot === "string") return slot;
    if (typeof slot === "object" && slot.time) return slot.time;
    return "";
  };

  /* ==============================
     HANDLE ADD SLOT
     Now handles slot objects with location info
  ============================== */
  const handleAddSlotSubmit = async (slotData) => {
    const slotTime = slotData.time;
    
    // Check if slot with this time already exists
    const slotExists = combinedSlots.includes(slotTime);
    if (slotExists) {
      setError("Este horário já existe");
      return;
    }

    setLoading(true);
    setError("");

    // Create slot object
    const slot = {
      time: slotTime,
      appointmentType: slotData.appointmentType,
      allowedLocationIds: slotData.allowedLocationIds || [],
    };

    const result = await onAddSlot(slot);

    if (result.success) {
      // Reset form
      setSlotTime("12:00");
      setSlotAppointmentType(appointmentTypeConfig.mode === APPOINTMENT_TYPE_MODE.FIXED 
        ? appointmentTypeConfig.fixedType 
        : APPOINTMENT_TYPE.ONLINE);
      setSlotLocationIds([]);
    } else {
      setError(result.error || "Erro ao adicionar horário");
    }

    setLoading(false);
  };

  /* ==============================
     HANDLE REMOVE SLOT
     Handles both string and object slot formats
  ============================== */
  const handleRemoveSlot = async (slot) => {
    setLoading(true);
    // Extract time from slot for removal
    const slotToRemove = typeof slot === "string" ? slot : (slot?.time || slot);
    const result = await onRemoveSlot(slotToRemove);
    if (!result.success) {
      setError(result.error || "Erro ao remover horário");
    }
    setLoading(false);
  };

  /* ==============================
     HANDLE DELETE/CANCEL (MODAL)
  ============================== */
  const handleOpenModal = (slot) => {
    const appointment = getAppointmentBySlot(slot);
    if (!appointment) return;

    const patient = patients.find((p) => p.id === appointment.patientId);
    const displayName = patient?.referenceName || appointment.patientName;

    setSelectedAppointment({
      ...appointment,
      displayName,
    });
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAppointment) return;

    setLoading(true);
    const result = await onDeleteAppointment(selectedAppointment.id);
    
    if (result.success) {
      setModalOpen(false);
      setSelectedAppointment(null);
    } else {
      setError(result.error || "Erro ao excluir consulta");
    }
    
    setLoading(false);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;

    setLoading(true);
    const result = await onMarkAsCancelled(selectedAppointment.id);
    
    if (result.success) {
      setModalOpen(false);
      setSelectedAppointment(null);
    } else {
      setError(result.error || "Erro ao marcar como cancelado");
    }
    
    setLoading(false);
  };

  /* ==============================
     HANDLE BOOK APPOINTMENT
  ============================== */
  const handleBookAppointment = async () => {
    if (!selectedPatient || !selectedTime) {
      setError("Selecione paciente e horário");
      return;
    }

    // Validar formato de horário (HH:mm)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(selectedTime)) {
      setError("Horário inválido. Use o formato HH:mm (ex: 14:30)");
      return;
    }

    // Verificar se o horário já está ocupado
    if (isTimeBooked(selectedTime)) {
      setError("Este horário já está ocupado. Selecione outro horário.");
      return;
    }

    // Validar local quando presencial
    if (requiresLocation && !bookLocationId) {
      setError("Selecione pelo menos um local para atendimento presencial");
      return;
    }

    setLoading(true);
    setError("");

    const result = await onBookAppointment(selectedPatient, selectedTime, bookAppointmentType, bookLocationId || null);

    if (result.success) {
      setSelectedPatient("");
      setSelectedTime("");
      setBookAppointmentType(APPOINTMENT_TYPE.ONLINE);
      setBookLocationId("");
    } else {
      setError(result.error || "Erro ao marcar consulta");
    }

    setLoading(false);
  };

  /* ==============================
     VALIDATE TIME FOR BOOKING
     Verifica se o horário selecionado já está ocupado
  ============================== */
  const isTimeBooked = (time) => {
    const bookedTimes = activeAppointments.map((a) => a.time);
    return bookedTimes.includes(time);
  };

  /* ==============================
     SORTED PATIENTS
  ============================== */
  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => {
      const nameA = (a.referenceName || a.name).toLowerCase();
      const nameB = (b.referenceName || b.name).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [patients]);

  /* ==============================
     RENDER
  ============================== */
  return (
    <div className="day-slots-card">
      <h3>
        <FaCalendarDay /> DIA {formattedDate}
      </h3>

      <DayStats 
        appointments={appointments}
        activeAppointments={activeAppointments}
        totalSlots={combinedSlots.length}
      />

      <div className="slots-list">
        {combinedSlots.length === 0 ? (
          <p className="empty-message">Nenhum horário cadastrado</p>
        ) : (
          combinedSlots.map((slotTime, i) => {
            // Find the original slot object if it exists in allSlots
            const originalSlot = allSlots.find(slot => {
              const time = typeof slot === "string" ? slot : (slot?.time || null);
              return time === slotTime;
            }) || slotTime; // Fallback to string if not found
            
            const appointment = getAppointmentBySlot(slotTime);
            let displayName = null;

            if (appointment) {
              const patient = patients.find((p) => p.id === appointment.patientId);
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
                onRemove={() => handleRemoveSlot(originalSlot)}
                onDelete={() => handleOpenModal(slotTime)}
                doctor={doctor}
              />
            );
          })
        )}
      </div>

      <div className="mode-toggle">
        <button
          className={mode === "add" ? "active" : ""}
          onClick={() => {
            setMode("add");
            setError("");
          }}
        >
          Adicionar Horário
        </button>
        <button
          className={mode === "book" ? "active" : ""}
          onClick={() => {
            setMode("book");
            setError("");
            // Sempre inicia com 12:00 ao entrar no modo "Marcar Consulta"
            if (!selectedTime) {
              setSelectedTime("12:00");
            }
          }}
        >
          Marcar Consulta
        </button>
      </div>

      <div ref={formSectionRef}>
        {mode === "add" && (
          <SlotForm
            time={slotTime}
            onTimeChange={setSlotTime}
            appointmentType={slotAppointmentType}
            onAppointmentTypeChange={setSlotAppointmentType}
            selectedLocationIds={slotLocationIds}
            onLocationIdsChange={setSlotLocationIds}
            locations={locations}
            appointmentTypeConfig={appointmentTypeConfig}
            onSubmit={handleAddSlotSubmit}
            loading={loading || isLimitReached}
            error={error}
          />
        )}

        {mode === "book" && (
          <div className="book-slot">
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              disabled={loading || isLimitReached}
              title={isLimitReached ? "Limite do plano atingido" : ""}
            >
              <option value="">Selecione o paciente</option>
              {sortedPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.referenceName || p.name} — R$ {p.price || 0}
                </option>
              ))}
            </select>

            {showAppointmentType && !isFixed && (
              <select
                value={bookAppointmentType}
                onChange={(e) => {
                  setBookAppointmentType(e.target.value);
                  setBookLocationId("");
                }}
                disabled={loading || isLimitReached}
                title={isLimitReached ? "Limite do plano atingido" : ""}
              >
                {getAppointmentTypeOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {showLocationSelector && (
              <select
                value={bookLocationId}
                onChange={(e) => setBookLocationId(e.target.value)}
                disabled={loading || isLimitReached || locations.length === 1}
                required={requiresLocation}
                title={isLimitReached ? "Limite do plano atingido" : ""}
              >
                <option value="">Selecione um local</option>
                {locations.map((location, index) => (
                  <option key={location.name || `location-${index}`} value={location.name}>
                    {location.name}
                    {location.defaultValue > 0 && ` - R$ ${location.defaultValue.toFixed(2)}`}
                  </option>
                ))}
              </select>
            )}

            <input
              type="time"
              value={selectedTime}
              onChange={(e) => {
                // Normaliza para formato 24h mesmo no mobile
                const normalizedTime = normalizeTo24Hour(e.target.value);
                setSelectedTime(normalizedTime);
              }}
              disabled={loading || isLimitReached}
              min="00:00"
              max="23:59"
              step="60"
              lang="pt-BR"
              className="book-slot-time-input"
              placeholder="Selecione o horário"
              title={isLimitReached ? "Limite do plano atingido" : "Selecione o horário"}
              data-format="24"
            />

            <button onClick={handleBookAppointment} disabled={loading || isLimitReached} title={isLimitReached ? "Limite do plano atingido" : ""}>
              {loading ? "Confirmando..." : "Confirmar"}
            </button>
          </div>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      <DeleteConfirmationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAppointment(null);
        }}
        onConfirmDelete={handleConfirmDelete}
        onConfirmCancel={handleConfirmCancel}
        patientName={selectedAppointment?.displayName}
        time={selectedAppointment?.time}
        loading={loading}
      />
    </div>
  );
}