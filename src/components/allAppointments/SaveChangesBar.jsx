// ========================================
// SaveChangesBar.jsx
// ========================================
import React from "react";
import { Save } from "lucide-react";
import Button from "../common/Button";
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
        <Button
          variant="primary"
          onClick={onSave}
          loading={saving}
          leftIcon={!saving ? <Save size={18} /> : null}
          className="save-bar__save-button"
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}