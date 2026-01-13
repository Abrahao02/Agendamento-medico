import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import "./DateNavigation.css";

export default function DateNavigation({ currentDate, onPrev, onNext, onToday, formatDate }) {
  return (
    <div className="date-navigation">
      <button className="btn-secondary" onClick={onPrev}><FiArrowLeft /> Anterior</button>
      <span>{formatDate(currentDate)}</span>
      <button className="btn-secondary" onClick={onNext}>Próximo <FiArrowRight /></button>
      <button className="btn-primary" onClick={onToday}>Hoje</button>
    </div>
  );
}
