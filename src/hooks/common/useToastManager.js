import { useState, useCallback, useRef, useMemo } from "react";

/**
 * Função helper para criar ID único
 */
function createId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Hook para gerenciar sistema de toasts/notificações
 * @returns {Object} Estado, refs e API
 */
export const useToastManager = () => {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((toast) => {
    const id = toast.id || createId();
    const duration = typeof toast.duration === "number" ? toast.duration : 4000;

    const next = {
      id,
      variant: toast.variant || "info",
      title: toast.title || "",
      description: toast.description || "",
      duration,
    };

    setToasts((prev) => [...prev, next].slice(-5));

    if (duration > 0) {
      const timeout = setTimeout(() => dismiss(id), duration);
      timeoutsRef.current.set(id, timeout);
    }

    return id;
  }, [dismiss]);

  const api = useMemo(() => ({
    show,
    dismiss,
    success: (title, opts = {}) => show({ ...opts, variant: "success", title }),
    error: (title, opts = {}) => show({ ...opts, variant: "error", title }),
    info: (title, opts = {}) => show({ ...opts, variant: "info", title }),
  }), [dismiss, show]);

  return {
    state: {
      toasts,
    },
    refs: {
      timeoutsRef,
    },
    api,
  };
};
