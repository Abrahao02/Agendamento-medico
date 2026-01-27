// ============================================
// 📁 src/components/common/Filters/LocationFilter.jsx
// Filtro por local de atendimento
// ============================================

import React from "react";

export default function LocationFilter({
  selectedLocation,
  onLocationChange,
  availableLocations = [],
  disabled = false,
}) {
  // Não renderiza se não houver locations (0 locations)
  if (!availableLocations || availableLocations.length === 0) {
    return null;
  }

  return (
    <select
      id="location-filter"
      value={selectedLocation || "all"}
      onChange={(e) => onLocationChange(e.target.value)}
      disabled={disabled}
      className="location-filter-select"
      aria-label="Filtrar por local de atendimento"
    >
      <option value="all">Todos os locais</option>
      {availableLocations.map((location) => (
        <option key={location.name} value={location.name}>
          {location.name}
        </option>
      ))}
    </select>
  );
}
