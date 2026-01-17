// ============================================
// 📁 src/components/common/Filters/SearchFilter.jsx
// Responsabilidade: Filtro de busca
// ============================================

import React from "react";
import { Search } from "lucide-react";
import "./Filters.css";

export default function SearchFilter({
  searchTerm,
  onSearchChange,
  placeholder = "Buscar...",
}) {
  return (
    <div className="filter-item filter-search">
      <label htmlFor="search">Buscar</label>
      <div className="filter-search-input-wrapper">
        <Search size={20} className="filter-search-icon" />
        <input
          id="search"
          type="search"
          value={searchTerm || ""}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="filter-input"
        />
      </div>
    </div>
  );
}
