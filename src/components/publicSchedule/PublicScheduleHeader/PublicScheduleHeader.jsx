// ============================================
// 📁 src/components/publicSchedule/PublicScheduleHeader.jsx
// ============================================
export default function PublicScheduleHeader({ doctor }) {
  return (
    <header className="schedule-header">
      <div className="doctor-info">
        <div className="doctor-avatar">
          {doctor.name[0].toUpperCase()}
        </div>
        <div>
          <h1>Agende sua consulta</h1>
          <p className="doctor-name">Profissional da Saúde: {doctor.name}</p>
        </div>
      </div>
    </header>
  );
}
