// src/components/common/PageHeader/PageHeader.jsx
import React from "react";
import "./PageHeader.css";

export default function PageHeader({ label, title, description }) {
  return (
    <header className="padrao-header">
      {label && <span className="label">{label}</span>}
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
    </header>
  );
}
