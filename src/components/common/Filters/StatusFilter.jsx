// ============================================
// 📁 src/components/common/Filters/StatusFilter.jsx
// Responsabilidade: Filtro de status
// ============================================

import React from "react";
import "./Filters.css";

export default function StatusFilter({
  statusFilter,
  onStatusChange,
  statusOptions = [],
}) {
  if (statusOptions.length === 0) return null;

  return (
    <div className="filter-item">
      <label htmlFor="status">Status</label>
      <select
        id="status"
        value={statusFilter || "Todos"}
        onChange={(e) => onStatusChange(e.target.value)}
        className="filter-select"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
