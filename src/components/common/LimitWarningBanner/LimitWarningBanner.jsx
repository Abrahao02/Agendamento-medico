// ============================================
// 📁 src/components/common/LimitWarningBanner/LimitWarningBanner.jsx
// Reusable warning banner for limit reached state
// ============================================

import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./LimitWarningBanner.css";

export default function LimitWarningBanner() {
  const navigate = useNavigate();

  const handleUpgrade = (e) => {
    e.preventDefault();
    navigate("/dashboard/settings");
  };

  return (
    <div className="limit-warning-banner" role="alert">
      <div className="limit-warning-content">
        <AlertTriangle size={20} className="limit-warning-icon" />
        <p className="limit-warning-text">
          Atenção: você chegou ao limite permitido de consultas atendidas no mês.{" "}
          <a href="/dashboard/settings" onClick={handleUpgrade} className="limit-warning-link">
            Assinar PRO
          </a>{" "}
          para liberar.
        </p>
      </div>
    </div>
  );
}
