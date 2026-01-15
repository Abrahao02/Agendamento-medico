import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../common/Button";
import "./DateNavigation.css";

export default function DateNavigation({ currentDate, onPrev, onNext, onToday, formatDate }) {
  return (
    <div className="date-navigation">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onPrev}
        leftIcon={<ChevronLeft size={16} />}
        className="date-nav-btn date-nav-prev"
      >
        Anterior
      </Button>
      <span>{formatDate(currentDate)}</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onNext}
        rightIcon={<ChevronRight size={16} />}
        className="date-nav-btn date-nav-next"
      >
        Próximo
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={onToday}
        className="date-nav-btn date-nav-today"
      >
        Hoje
      </Button>
    </div>
  );
}
