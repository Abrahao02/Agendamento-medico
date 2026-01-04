import { useLocation, useNavigate } from "react-router-dom";
import "./PublicScheduleSuccess.css";
import formatDate from "../utils/formatDate";

export default function PublicScheduleSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, date, time } = location.state || {};

  if (!name) {
    // Se tentar acessar direto sem dados
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="public-schedule-container">
      <h2>Agendamento Confirmado!</h2>
      <p>
        Olá <strong>{name}</strong>, seu horário foi agendado para <strong>{formatDate(date)}</strong> às <strong>{time}</strong>.
      </p>
      <p>Você receberá a confirmação via WhatsApp em breve.</p>
    </div>
  );
}
