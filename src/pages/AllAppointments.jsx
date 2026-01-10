import { useState, useEffect, useMemo, useCallback } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import "./AllAppointments.css";
import formatDate from "../utils/formatters/formatDate";

export default function AllAppointments() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedPatients, setExpandedPatients] = useState(new Set());
  const [changedIds, setChangedIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchAppointments = async () => {
      setLoadingData(true);
      try {
        const q = query(collection(db, "appointments"), where("doctorId", "==", user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          if (a.date === b.date) return a.time.localeCompare(b.time);
          return a.date.localeCompare(b.date);
        });
        setAppointments(data);
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const togglePatient = useCallback((patient) => {
    setExpandedPatients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patient)) newSet.delete(patient);
      else newSet.add(patient);
      return newSet;
    });
  }, []);

  const handleStatusChange = useCallback((id, newStatus) => {
    setAppointments(prev => prev.map(app => (app.id === id ? { ...app, status: newStatus } : app)));
    setChangedIds(prev => new Set([...prev, id]));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const changedAppointments = appointments.filter(app => changedIds.has(app.id));
      const updates = changedAppointments.map(app =>
        updateDoc(doc(db, "appointments", app.id), { status: app.status })
      );
      await Promise.all(updates);
      setChangedIds(new Set());
      alert("✅ Alterações salvas com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
      alert("❌ Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = useCallback(() => {
    setStatusFilter("Todos");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      if (statusFilter !== "Todos" && app.status !== statusFilter) return false;
      if (startDate && app.date < startDate) return false;
      if (endDate && app.date > endDate) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const name = (app.referenceName || app.patientName || "").toLowerCase();
        const phone = (app.patientWhatsapp || "").toLowerCase();
        if (!name.includes(search) && !phone.includes(search)) return false;
      }
      return true;
    });
  }, [appointments, statusFilter, startDate, endDate, searchTerm]);

  const patientsData = useMemo(() => {
    const patients = {};
    filteredAppointments.forEach(app => {
      const whatsapp = app.patientWhatsapp;
      const patientName = app.referenceName?.trim() || app.patientName;
      if (!patients[whatsapp]) {
        patients[whatsapp] = {
          name: patientName,
          whatsapp,
          appointments: [],
          totalValue: 0,
          statusCounts: {}
        };
      }
      patients[whatsapp].appointments.push(app);
      patients[whatsapp].totalValue += app.value || 0;
      patients[whatsapp].statusCounts[app.status] =
        (patients[whatsapp].statusCounts[app.status] || 0) + 1;
    });
    return Object.values(patients).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredAppointments]);

  const toggleAll = useCallback((expand) => {
    if (expand) setExpandedPatients(new Set(patientsData.map(p => p.name)));
    else setExpandedPatients(new Set());
  }, [patientsData]);

  if (loading || loadingData) {
    return (
      <div className="appointments-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  const totalAppointments = filteredAppointments.length;
  const totalValue = filteredAppointments.reduce((sum, app) => sum + (app.value || 0), 0);

  const handleSendWhatsappReport = (patient) => {
    const messages = patient.appointments.map(
      app => `${formatDate(app.date)} às ${app.time} - R$ ${(app.value || 0).toFixed(2)}`
    );
    const text = `Seguem as datas e valores de suas consultas:\n${messages.join("\n")}`;
    const phone = patient.whatsapp.replace(/\D/g, ""); // remove qualquer caractere não numérico
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };


  return (
    <div className="appointments-page">
      <div className="appointments-container">
        {/* Header */}
        <header className="page-header">
          <div className="header-content">
            <h2 className="page-title">Todos os Agendamentos</h2>
            <p className="page-subtitle">
              {totalAppointments} agendamento{totalAppointments !== 1 ? 's' : ''} •
              Total: <strong>R$ {totalValue.toFixed(2)}</strong> •
              Pacientes: <strong>{patientsData.length}</strong>
            </p>
          </div>
        </header>

        {/* Filters */}
        <section className="filters-section">
          <div className="filters-grid">
            <div className="filter-group search-input-wrapper">
              <input
                type="search"
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="Todos">Todos</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Pendente">Pendente</option>
                <option value="Não Compareceu">Não Compareceu</option>
                <option value="Msg enviada">Msg enviada</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="date-input"
              />
            </div>
          </div>

          <div className="filters-actions">
            <button className="btn btn-ghost" onClick={resetFilters}>Resetar</button>
            <button className="btn btn-ghost" onClick={() => toggleAll(true)}>Expandir Todos</button>
            <button className="btn btn-ghost" onClick={() => toggleAll(false)}>Contrair Todos</button>
          </div>
        </section>

        {/* Patients */}
        <div className="patients-list">
          {patientsData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Nenhum agendamento encontrado</h3>
              <p>Limpe os filtros para tentar novamente.</p>
            </div>
          ) : (
            patientsData.map(patient => {
              const isExpanded = expandedPatients.has(patient.name);
              return (
                <div key={patient.name} className="patient-card">
                  <button
                    className="patient-header"
                    onClick={() => togglePatient(patient.name)}
                  >
                    <div className="patient-info">
                      <div className="patient-details">
                        <h3>{patient.name}</h3>
                        <p className="patient-stats-text">
                          {patient.appointments.length} consulta{patient.appointments.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="patient-meta">
                      <span className="patient-total">R$ {patient.totalValue.toFixed(2)}</span>
                      <button
                        className="btn btn-ghost btn-small"
                        onClick={() => handleSendWhatsappReport(patient)}
                        title="Enviar relatório por WhatsApp"
                      >
                        📤
                      </button>
                      <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
                    </div>

                  </button>


                  {isExpanded && (
                    <div className="appointments-list">
                      {patient.appointments.map(app => (
                        <div
                          key={app.id}
                          className={`appointment-card ${changedIds.has(app.id) ? 'changed' : ''}`}
                          data-status={app.status}
                        >
                          <div className="appointment-date">
                            <span className="day">{formatDate(app.date, 'day')}</span>
                            <span className="month">{formatDate(app.date, 'month')}</span>
                            <span className="time">{app.time}</span>
                          </div>
                          <div className="appointment-details">
                            <div className="appointment-contact">
                              <span>📱 {app.patientWhatsapp}</span>
                            </div>
                            <div className="appointment-value">R$ {(app.value || 0).toFixed(2)}</div>
                          </div>
                          <div className="status-select-wrapper">
                            <select
                              value={app.status}
                              onChange={e => handleStatusChange(app.id, e.target.value)}
                              className="status-select"
                              data-status={app.status}
                            >
                              <option value="Pendente">Pendente</option>
                              <option value="Confirmado">Confirmado</option>
                              <option value="Não Compareceu">Não Compareceu</option>
                              <option value="Msg enviada">Msg enviada</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {changedIds.size > 0 && (
          <div className="save-bar">
            <div className="save-bar-content">
              <div className="changes-badge">
                <span>{changedIds.size}</span>
                {changedIds.size > 1 ? ' alterações não salvas' : ' alteração não salva'}
              </div>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '💾 Salvando...' : '💾 Salvar Alterações'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
