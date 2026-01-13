// ========================================
// SaveChangesBar.jsx
// ========================================
import React from "react";
import "./SaveChangesBar.css";

export default function SaveChangesBar({ changesCount, saving, onSave }) {
  if (changesCount === 0) return null;

  return (
    <div className={`save-bar ${saving ? "saving" : ""}`}>
      <div className="save-bar-content">
        <div className="changes-badge">
          <span>{changesCount}</span>
          {changesCount > 1 ? " alterações não salvas" : " alteração não salva"}
        </div>
        <button
          className="btn btn-primary"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "💾 Salvando..." : "💾 Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}