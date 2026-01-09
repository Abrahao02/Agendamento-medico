import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PublicScheduleSuccess.css";
import formatDate from "../utils/formatters/formatDate";

export default function PublicScheduleSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, date, time } = location.state || {};

  // 🔹 Redireciona para a home se tentar acessar direto
  useEffect(() => {
    if (!name) {
      const timer = setTimeout(() => navigate("/", { replace: true }), 3000);
      return () => clearTimeout(timer);
    }
  }, [name, navigate]);

  if (!name)
    return (
      <div className="public-schedule-container">
        <h2>Acesso inválido</h2>
        <p>Você não pode acessar esta página diretamente. Redirecionando...</p>
      </div>
    );

  return (
    <div className="public-schedule-container">
      <h2>Agendamento Confirmado!</h2>
      <p>
        Olá <strong>{name}</strong>, seu horário foi agendado para{" "}
        <strong>{formatDate(date)}</strong> às <strong>{time}</strong>.
      </p>
      <p>Você receberá a confirmação via WhatsApp em breve.</p>
    </div>
  );
}
