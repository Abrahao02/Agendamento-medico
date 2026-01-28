import React, { createContext } from "react";
import { X } from "lucide-react";
import { useToastManager } from "../../../hooks/common/useToastManager";
import "./Toast.css";

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { state, api } = useToastManager();

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-viewport" role="region" aria-label="Notificações">
        {state.toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.variant}`}
            role={t.variant === "error" ? "alert" : "status"}
            aria-live={t.variant === "error" ? "assertive" : "polite"}
          >
            <div className="toast-content">
              {t.title && <div className="toast-title">{t.title}</div>}
              {t.description && <div className="toast-description">{t.description}</div>}
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => api.dismiss(t.id)}
              aria-label="Fechar notificação"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

