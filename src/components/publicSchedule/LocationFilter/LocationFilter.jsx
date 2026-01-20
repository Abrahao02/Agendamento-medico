// ============================================
// Location Filter Component
// Allows patients to filter appointments by location
// ============================================
import React from "react";
import { MapPin, X, MessageCircle } from "lucide-react";
import { cleanWhatsapp } from "../../../utils/whatsapp/cleanWhatsapp";
import { formatLocationDisplay, generatePriceInquiryMessage } from "../../../utils/publicSchedule/priceDisplay";
import { formatCurrency } from "../../../utils/formatter/formatCurrency";
import "./LocationFilter.css";

export default function LocationFilter({
  locations = [],
  selectedLocation,
  onLocationChange,
  showAllOption = true,
  showPrice = true,
  doctor = null,
}) {
  if (locations.length === 0) {
    return null;
  }

  const handleLocationSelect = (locationId) => {
    if (selectedLocation === locationId) {
      // Deselect if clicking the same location
      onLocationChange(null);
    } else {
      onLocationChange(locationId);
    }
  };

  const getWhatsAppUrl = (locationName) => {
    if (!doctor?.whatsapp) return "#";
    const message = generatePriceInquiryMessage(locationName);
    const cleanNumber = cleanWhatsapp(doctor.whatsapp);
    const number = cleanNumber.startsWith("55") ? cleanNumber : `55${cleanNumber}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${number}?text=${encodedMessage}`;
  };

  const selectedLocationData = locations.find(
    loc => (loc.id || loc.name) === selectedLocation
  );

  return (
    <div className="location-filter">
      <div className="location-filter-header">
        <MapPin size={18} />
        <span className="location-filter-title">Local da consulta</span>
        {selectedLocation && (
          <button
            className="location-filter-clear"
            onClick={() => onLocationChange(null)}
            title="Limpar filtro"
          >
            <X size={14} />
            Limpar
          </button>
        )}
      </div>

      <div className="location-filter-options">
        {showAllOption && (
          <button
            className={`location-filter-option ${!selectedLocation ? 'active' : ''}`}
            onClick={() => onLocationChange(null)}
          >
            Todos os locais
          </button>
        )}

        {locations.map((location) => (
          <button
            key={location.id || location.name}
            className={`location-filter-option ${selectedLocation === (location.id || location.name) ? 'active' : ''}`}
            onClick={() => handleLocationSelect(location.id || location.name)}
          >
            <span className="location-filter-name">{location.name}</span>
            {showPrice && location.price !== undefined && location.price > 0 && (
              <span className="location-filter-price">
                {formatCurrency(location.price)}
              </span>
            )}
            {!showPrice && (
              <span className="location-filter-price-info">
                Valor sob consulta
              </span>
            )}
          </button>
        ))}
      </div>

      {!showPrice && selectedLocation && selectedLocationData && doctor?.whatsapp && (
        <div className="location-filter-whatsapp">
          <p className="location-filter-whatsapp-text">
            Para consultar o valor, entre em contato via WhatsApp:
          </p>
          <a
            href={getWhatsAppUrl(selectedLocationData.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="location-filter-whatsapp-button"
          >
            <MessageCircle size={18} />
            Consultar valor no WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
