import React from 'react';
import { X, Trash2, MapPin, Video } from 'lucide-react';
import { getStatusConfig } from '../../../constants/appointmentStatus';
import { getSlotDisplayInfo } from '../../../utils/availability/normalizeSlot';
import './SlotItem.css';

function SlotItem({ 
  slot, 
  slotData, 
  isBooked, 
  patientName,
  status,
  appointment,
  doctor,
  onRemove, 
  onDelete 
}) {
  const statusConfig = status ? getStatusConfig(status) : null;
  
  // Get slot display info (location, appointment type)
  const slotInfo = slotData && doctor 
    ? getSlotDisplayInfo(slotData, doctor)
    : { 
        time: slot, 
        appointmentType: 'presencial', 
        locations: [], 
        hasLocation: false,
        isOnline: false 
      };

  // Get appointment location/type info
  const appointmentLocation = appointment?.location || null;
  const appointmentType = appointment?.appointmentType || null;
  const isAppointmentOnline = appointmentType === 'online';
  const hasAppointmentLocation = appointmentLocation && appointmentType === 'presencial';

  return (
    <div className={`slot-item ${isBooked ? 'booked' : 'free'} ${statusConfig?.cssClass || ''}`}>
      <div className="slot-content">
        <span className="slot-time-text">{slot}</span>
        
        {!isBooked && (
          <div className="slot-type-badges">
            {slotInfo.isOnline && (
              <span className="slot-type-badge online" title="Online">
                <Video size={12} />
                <span>Online</span>
              </span>
            )}
            {slotInfo.hasLocation && slotInfo.locations.length > 0 && (
              <span className="slot-type-badge location" title={slotInfo.locations.map(l => l.name).join(', ')}>
                <MapPin size={12} />
                <span>{slotInfo.locations.length === 1 
                  ? slotInfo.locations[0].name 
                  : `${slotInfo.locations.length} locais`}</span>
              </span>
            )}
          </div>
        )}
        
        {isBooked && patientName && (
          <>
            <span className="slot-name">{patientName}</span>
            {statusConfig && (
              <span className={`slot-status ${statusConfig.cssClass}`}>
                {statusConfig.label}
              </span>
            )}
            {(hasAppointmentLocation || isAppointmentOnline) && (
              isAppointmentOnline ? (
                <span className="slot-location-badge online">
                  <Video size={12} />
                  <span>Online</span>
                </span>
              ) : hasAppointmentLocation ? (
                <span className="slot-location-badge location">
                  <MapPin size={12} />
                  <span>{appointmentLocation}</span>
                </span>
              ) : null
            )}
          </>
        )}
      </div>

      {isBooked ? (
        <button 
          className="slot-action slot-delete"
          onClick={() => onDelete(slot)}
          title="Excluir ou cancelar"
        >
          <Trash2 size={16} />
        </button>
      ) : (
        <button 
          className="slot-action slot-remove"
          onClick={() => onRemove(slot)}
          title="Remover horário"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default React.memo(SlotItem);