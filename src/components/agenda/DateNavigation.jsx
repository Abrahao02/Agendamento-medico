import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import Button from "../common/Button";
import "./DateNavigation.css";

export default function DateNavigation({ currentDate, onPrev, onNext, onToday }) {
  // Formato curto de data: Hoje/Amanhã/Ontem ou data formatada
  const formatDateShort = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Obtém o dia da semana
  const getWeekday = (date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long' });
  };

  return (
    <div className="date-navigation">
      {/* Botão Anterior - apenas ícone */}
      <button
        onClick={onPrev}
        className="date-nav-icon-btn date-nav-prev"
        aria-label="Dia anterior"
        title="Dia anterior"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Display de Data com ícone de calendário */}
      <div className="date-display-wrapper">
        <Calendar size={20} className="date-calendar-icon" />
        <div className="date-display">
          <div className="date-display-main">{formatDateShort(currentDate)}</div>
          <div className="date-display-weekday">{getWeekday(currentDate)}</div>
        </div>
      </div>

      {/* Botão Próximo - apenas ícone */}
      <button
        onClick={onNext}
        className="date-nav-icon-btn date-nav-next"
        aria-label="Próximo dia"
        title="Próximo dia"
      >
        <ChevronRight size={20} />
      </button>

      {/* Botão Hoje */}
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={onToday}
        className="date-nav-today-btn"
      >
        Hoje
      </Button>
    </div>
  );
}
