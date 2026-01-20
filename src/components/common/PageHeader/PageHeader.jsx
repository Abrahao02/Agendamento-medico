// src/components/common/PageHeader/PageHeader.jsx
import React from "react";
import "./PageHeader.css";

export default function PageHeader({ label, title, description }) {
  return (
    <header className="padrao-header">
      {(label || title) && (
        <div className="padrao-header-title-row">
          {title && <h2>{title}</h2>}
          {label && <span className="label">{label}</span>}
        </div>
      )}
      {description && <p>{description}</p>}
    </header>
  );
}
