// ============================================
// 📁 src/pages/Agenda.jsx - MELHORADO
// Seguindo padrão do Dashboard com cards separados
// ============================================
import { useState, useEffect, useRef } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";

import useAgenda from "../hooks/agenda/useAgenda";
import PageHeader from "../components/common/PageHeader";
import DateNavigation from "../components/agenda/DateNavigation";
import AppointmentList from "../components/agenda/AppointmentList";
import DayStats from "../components/availability/DayStats";
import AvailableSlotsList from "../components/agenda/AvailableSlotsList";
import LimitWarningBanner from "../components/common/LimitWarningBanner";
import AgendaActionsModal from "../components/agenda/AgendaActionsModal";
import SlotForm from "../components/availability/SlotForm";
import DeleteConfirmationModal from "../components/availability/DeleteConfirmationModal";
import { formatDateToQuery } from "../utils/filters/dateFilters";
import { normalizeTo24Hour } from "../utils/time/normalizeTime";
import { formatCurrency } from "../utils/formatter/formatCurrency";
import { getAppointmentTypeOptions } from "../constants/appointmentType";
import { useToast } from "../components/common/Toast";

import "./Agenda.css";

export default function Agenda() {
  const { isLimitReached } = useOutletContext() || {};
  const location = useLocation();
  
  // Função auxiliar para converter string YYYY-MM-DD para Date sem problemas de timezone
  const parseDateString = (dateString) => {
    if (!dateString) return null;
    
    // Se já for uma Date, retorna
    if (dateString instanceof Date) {
      return dateString;
    }
    
    // Se for string no formato YYYY-MM-DD, parse manualmente
    if (typeof dateString === 'string') {
      const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
      const match = dateString.match(dateRegex);
      
      if (match) {
        const [, year, month, day] = match;
        // Criar Date usando componentes locais (evita problemas de timezone)
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      // Se não for formato YYYY-MM-DD, tenta new Date normal
      const parsed = new Date(dateString);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    return null;
  };
  
  // Inicializa com a data do location.state se disponível, senão usa a data atual
  const getInitialDate = () => {
    if (location.state?.date) {
      const parsedDate = parseDateString(location.state.date);
      if (parsedDate) {
        return parsedDate;
      }
    }
    return new Date();
  };
  
  const [currentDate, setCurrentDate] = useState(getInitialDate());
  
  // Atualiza a data quando o location.state mudar
  useEffect(() => {
    if (location.state?.date) {
      const parsedDate = parseDateString(location.state.date);
      if (parsedDate) {
        setCurrentDate(parsedDate);
      }
    }
  }, [location.state]);

  const {
    appointments,
    statusUpdates,
    referenceNames,
    patientStatus,
    lockedAppointments,
    handleStatusChange,
    handleAddPatient,
    handleSendWhatsapp,
    handleRemoveSlot,
    handleAddSlot,
    handleBookAppointment,
    handleDeleteAppointment,
    handleMarkAsCancelled,
    totalSlots,
    freeSlots,
    stats,
    occupancyRate,
    activeAppointments,
    doctor,
    patients,
  } = useAgenda(currentDate);

  const toast = useToast();
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState(null); // "book" | "add" | null
  const formSectionRef = useRef(null);
  
  // Estados para formulário de marcar consulta
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [bookAppointmentType, setBookAppointmentType] = useState(() => {
    // Será atualizado quando doctor carregar
    return "online";
  });
  const [bookLocationId, setBookLocationId] = useState("");
  const [priceMode, setPriceMode] = useState("patient");
  const [dealValue, setDealValue] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  
  // Estados para formulário de adicionar slot
  const [slotTime, setSlotTime] = useState("12:00");
  const [slotAppointmentType, setSlotAppointmentType] = useState(() => {
    // Inicializar baseado na configuração do doctor (será atualizado quando doctor carregar)
    return "online";
  });
  const [slotLocationIds, setSlotLocationIds] = useState([]);
  const [slotFormError, setSlotFormError] = useState("");
  const [slotFormLoading, setSlotFormLoading] = useState(false);
  
  // Atualizar tipos de atendimento quando doctor carregar
  useEffect(() => {
    if (doctor?.appointmentTypeConfig) {
      const config = doctor.appointmentTypeConfig;
      if (config.mode === "fixed") {
        setSlotAppointmentType(config.fixedType);
        setBookAppointmentType(config.fixedType);
      }
    }
  }, [doctor]);

  // Scroll para centralizar o formulário quando formMode muda
  useEffect(() => {
    if (formSectionRef.current && formMode) {
      setTimeout(() => {
        formSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }, 100);
    }
  }, [formMode]);

  // Estados para modal de confirmação de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAppointmentForDelete, setSelectedAppointmentForDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const currentDateStr = formatDateToQuery(currentDate);
  
  // Obter slots do dia atual
  const dayAvailability = appointments.length > 0 || freeSlots.length > 0 
    ? { date: currentDateStr, slots: freeSlots } 
    : null;
  
  const allSlots = dayAvailability?.slots || [];
  
  // Handlers para modal de ações
  const handleOpenActionsModal = () => {
    setIsActionsModalOpen(true);
  };
  
  const handleCloseActionsModal = () => {
    setIsActionsModalOpen(false);
  };
  
  const handleSelectBook = () => {
    setFormMode("book");
    setFormError("");
    setSelectedTime("12:00");
  };
  
  const handleSelectAddSlot = () => {
    setFormMode("add");
    setSlotFormError("");
    setSlotTime("12:00");
  };
  
  const handleCancelForm = () => {
    setFormMode(null);
    setFormError("");
    setSlotFormError("");
    setSelectedPatient("");
    setSelectedTime("12:00");
    setSlotTime("12:00");
    setBookLocationId("");
    setDealValue("");
    setPriceMode("patient");
    setSlotLocationIds([]);
  };
  
  // Handler para adicionar slot
  const handleSubmitAddSlot = async (slotData) => {
    setSlotFormLoading(true);
    setSlotFormError("");
    
    try {
      // SlotForm retorna { time, appointmentType, allowedLocationIds }
      // Precisamos converter para o formato esperado pelo saveAvailability
      const slotToSave = slotData.allowedLocationIds && slotData.allowedLocationIds.length > 0
        ? {
            time: slotData.time,
            appointmentType: slotData.appointmentType,
            allowedLocationIds: slotData.allowedLocationIds,
          }
        : slotData.time; // Formato legacy (string) se não tiver locations
      
      const result = await handleAddSlot(slotToSave);
      if (result.success) {
        toast.success("Horário adicionado com sucesso!");
        handleCancelForm();
      } else {
        setSlotFormError(result.error || "Erro ao adicionar horário");
        toast.error(result.error || "Erro ao adicionar horário");
      }
    } catch (err) {
      setSlotFormError(err.message || "Erro ao adicionar horário");
      toast.error(err.message || "Erro ao adicionar horário");
    } finally {
      setSlotFormLoading(false);
    }
  };
  
  // Handler para marcar consulta
  const handleSubmitBookAppointment = async () => {
    if (!selectedPatient || !selectedTime) {
      setFormError("Selecione paciente e horário");
      return;
    }
    
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(selectedTime)) {
      setFormError("Horário inválido. Use o formato HH:mm (ex: 14:30)");
      return;
    }
    
    const appointmentTypeConfig = doctor?.appointmentTypeConfig || {
      mode: "disabled",
      fixedType: "Online",
      locations: [],
    };
    
    const isFixed = appointmentTypeConfig.mode === "fixed";
    const showLocationSelector = bookAppointmentType === "presencial" && appointmentTypeConfig.locations?.length > 0;
    const requiresLocation = bookAppointmentType === "presencial" && appointmentTypeConfig.locations?.length > 0;
    
    if (requiresLocation && !bookLocationId) {
      setFormError("Selecione um local para atendimento presencial");
      return;
    }
    
    let customValue = null;
    if (priceMode === "deal") {
      if (!dealValue.trim()) {
        setFormError("Informe o valor do acordo");
        return;
      }
      const normalizedDealValue = dealValue.replace(",", ".");
      const parsedValue = Number(normalizedDealValue);
      if (Number.isNaN(parsedValue) || parsedValue < 0) {
        setFormError("Valor inválido. Use 0,00 ou maior.");
        return;
      }
      customValue = parsedValue;
    }
    
    setFormLoading(true);
    setFormError("");
    
    try {
      const finalAppointmentType = isFixed ? appointmentTypeConfig.fixedType : bookAppointmentType;
      const result = await handleBookAppointment({
        patientId: selectedPatient,
        time: selectedTime,
        appointmentType: finalAppointmentType,
        location: bookLocationId || null,
        customValue,
      });
      
      if (result.success) {
        toast.success("Consulta marcada com sucesso!");
        handleCancelForm();
      } else {
        setFormError(result.error || "Erro ao marcar consulta");
        toast.error(result.error || "Erro ao marcar consulta");
      }
    } catch (err) {
      setFormError(err.message || "Erro ao marcar consulta");
      toast.error(err.message || "Erro ao marcar consulta");
    } finally {
      setFormLoading(false);
    }
  };
  
  // Configurações para formulários
  const appointmentTypeConfig = doctor?.appointmentTypeConfig || {
    mode: "disabled",
    fixedType: "Online",
    locations: [],
    defaultValueOnline: 0,
    defaultValuePresencial: 0,
  };
  
  const locations = appointmentTypeConfig.locations || [];
  const isFixed = appointmentTypeConfig.mode === "fixed";
  const showAppointmentType = appointmentTypeConfig.mode !== "disabled";
  const showLocationSelector = bookAppointmentType === "presencial" && locations.length > 0;
  const requiresLocation = bookAppointmentType === "presencial" && locations.length > 0;
  
  const sortedPatients = [...(patients || [])].sort((a, b) => {
    const nameA = (a.referenceName || a.name || "").toLowerCase();
    const nameB = (b.referenceName || b.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const goToPrev = () =>
    setCurrentDate((d) => {
      const newD = new Date(d);
      newD.setDate(d.getDate() - 1);
      return newD;
    });

  const goToNext = () =>
    setCurrentDate((d) => {
      const newD = new Date(d);
      newD.setDate(d.getDate() + 1);
      return newD;
    });

  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="agenda-page-content">
      <PageHeader
        label="Gestão diária"
        title="Agenda do dia"
        description="Gerencie seus horários e consultas do dia"
      />

      {/* Navegação de Datas */}
      <div className="agenda-date-navigation-card">
        <DateNavigation
          currentDate={currentDate}
          onPrev={goToPrev}
          onNext={goToNext}
          onToday={goToToday}
        />
      </div>

      {isLimitReached && <LimitWarningBanner />}

      {/* Cards de Estatísticas */}
      {totalSlots > 0 && (
        <div className="agenda-stats-card">
          <DayStats
            confirmedCount={stats.confirmed}
            pendingCount={stats.pending}
            occupancyRate={occupancyRate}
            activeCount={activeAppointments.length}
            totalSlots={totalSlots}
          />
        </div>
      )}

      {/* Lista de Horários Disponíveis */}
      {freeSlots.length > 0 && (
        <div className="agenda-available-slots-card">
          <AvailableSlotsList slots={freeSlots} onRemoveSlot={handleRemoveSlot} />
        </div>
      )}

      {/* Lista de Agendamentos */}
      <div className="agenda-appointments-card">
        <AppointmentList
          appointments={appointments}
          statusUpdates={statusUpdates}
          referenceNames={referenceNames}
          patientStatus={patientStatus}
          lockedAppointments={lockedAppointments}
          onStatusChange={handleStatusChange}
          onAddPatient={handleAddPatient}
          onSendWhatsapp={handleSendWhatsapp}
          onDeleteAppointment={(appointmentId) => {
            const appointment = appointments.find(a => a.id === appointmentId);
            if (appointment) {
              setSelectedAppointmentForDelete(appointment);
              setDeleteModalOpen(true);
            }
          }}
        />
      </div>

      {/* Seção de Formulários */}
      {formMode && (
        <div className="agenda-form-section" ref={formSectionRef}>
          {formMode === "add" && (
            <div className="agenda-form-card">
              <h3>Adicionar Horário Disponível</h3>
              <SlotForm
                time={slotTime}
                onTimeChange={(time) => {
                  setSlotTime(time);
                  setSlotFormError("");
                }}
                appointmentType={slotAppointmentType}
                onAppointmentTypeChange={(type) => {
                  setSlotAppointmentType(type);
                  setSlotLocationIds([]);
                }}
                selectedLocationIds={slotLocationIds}
                onLocationIdsChange={setSlotLocationIds}
                locations={locations}
                appointmentTypeConfig={appointmentTypeConfig}
                onSubmit={handleSubmitAddSlot}
                onCancel={handleCancelForm}
                loading={slotFormLoading}
                error={slotFormError}
              />
            </div>
          )}

          {formMode === "book" && (
            <div className="agenda-form-card">
              <h3>Marcar Consulta</h3>
              <div className="book-appointment-form">
                <select
                  value={selectedPatient}
                  onChange={(e) => {
                    setSelectedPatient(e.target.value);
                    setFormError("");
                  }}
                  disabled={formLoading || isLimitReached}
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
                    disabled={formLoading || isLimitReached}
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
                    disabled={formLoading || isLimitReached || locations.length === 1}
                    required={requiresLocation}
                    title={isLimitReached ? "Limite do plano atingido" : ""}
                  >
                    <option value="">Selecione um local</option>
                    {locations.map((location, index) => (
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
                    checked={priceMode === "deal"}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPriceMode("deal");
                      } else {
                        setPriceMode("patient");
                        setDealValue("");
                      }
                    }}
                    disabled={formLoading || isLimitReached}
                  />
                  <span>Acordo (definir valor diferente do padrão)</span>
                </label>

                {priceMode === "deal" && (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    disabled={formLoading || isLimitReached}
                    placeholder="0,00"
                    className="book-slot-price-input"
                    title={isLimitReached ? "Limite do plano atingido" : "Informe o valor do acordo"}
                  />
                )}

                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => {
                    const normalizedTime = normalizeTo24Hour(e.target.value);
                    setSelectedTime(normalizedTime);
                    setFormError("");
                  }}
                  disabled={formLoading || isLimitReached}
                  min="00:00"
                  max="23:59"
                  step="60"
                  lang="pt-BR"
                  className="book-slot-time-input"
                  placeholder="Selecione o horário"
                  title={isLimitReached ? "Limite do plano atingido" : "Selecione o horário"}
                  data-format="24"
                />

                {formError && <p className="error-message">{formError}</p>}

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleSubmitBookAppointment}
                    disabled={formLoading || isLimitReached}
                    title={isLimitReached ? "Limite do plano atingido" : ""}
                  >
                    {formLoading ? "Confirmando..." : "Confirmar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    disabled={formLoading}
                    className="cancel-button"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAB Button */}
      <button
        type="button"
        className="fab-button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleOpenActionsModal();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        disabled={isLimitReached}
        aria-label="Abrir opções de ação"
        title={isLimitReached ? "Limite do plano atingido" : "Adicionar consulta ou horário"}
      >
        <Plus size={24} />
      </button>

      {/* Modal de Ações */}
      <AgendaActionsModal
        isOpen={isActionsModalOpen}
        onClose={handleCloseActionsModal}
        onSelectBook={handleSelectBook}
        onSelectAddSlot={handleSelectAddSlot}
        isLimitReached={isLimitReached}
      />

      {/* Modal de Confirmação de Exclusão */}
      {selectedAppointmentForDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedAppointmentForDelete(null);
          }}
          onConfirmDelete={async () => {
            setDeleteLoading(true);
            const result = await handleDeleteAppointment(selectedAppointmentForDelete.id);
            setDeleteLoading(false);
            
            if (result.success) {
              toast.success("Consulta excluída com sucesso!");
              setDeleteModalOpen(false);
              setSelectedAppointmentForDelete(null);
            } else {
              toast.error(result.error || "Erro ao excluir consulta");
            }
          }}
          onConfirmCancel={async () => {
            setDeleteLoading(true);
            const result = await handleMarkAsCancelled(selectedAppointmentForDelete.id);
            setDeleteLoading(false);
            
            if (result.success) {
              toast.success("Consulta marcada como cancelada!");
              setDeleteModalOpen(false);
              setSelectedAppointmentForDelete(null);
            } else {
              toast.error(result.error || "Erro ao marcar como cancelada");
            }
          }}
          patientName={referenceNames[selectedAppointmentForDelete.id] || selectedAppointmentForDelete.patientName}
          time={selectedAppointmentForDelete.time}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}