import { useState, useEffect, useMemo, useCallback } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import "./AllAppointments.css";
import formatDate from "../utils/formatDate";

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

  // 🔐 Proteção de rota
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // 📥 Buscar agendamentos com loading state
  useEffect(() => {
    if (!user) return;

    const fetchAppointments = async () => {
      setLoadingData(true);
      try {
        const q = query(collection(db, "appointments"), where("doctorId", "==", user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // Ordena por data e horário
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

  // 🔄 Toggle expandir paciente (usando Set para melhor performance)
  const togglePatient = useCallback((patient) => {
    setExpandedPatients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patient)) {
        newSet.delete(patient);
      } else {
        newSet.add(patient);
      }
      return newSet;
    });
  }, []);

  // 🔄 Alterar status
  const handleStatusChange = useCallback((id, newStatus) => {
    setAppointments(prev =>
      prev.map(app => (app.id === id ? { ...app, status: newStatus } : app))
    );
    setChangedIds(prev => new Set([...prev, id]));
  }, []);

  // 💾 Salvar alterações (apenas os modificados)
  const handleSave = async () => {
    setSaving(true);
    try {
      const changedAppointments = appointments.filter(app => changedIds.has(app.id));
      const updates = changedAppointments.map(app =>
        updateDoc(doc(db, "appointments", app.id), { status: app.status })
      );
      await Promise.all(updates);
      setChangedIds(new Set());
      // Toast notification seria melhor que alert
      alert("✅ Alterações salvas com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
      alert("❌ Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Resetar filtros
  const resetFilters = useCallback(() => {
    setStatusFilter("Todos");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  }, []);

  // 🔹 Filtragem otimizada com useMemo
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

  // 🔹 Lista de pacientes únicos com stats
  const patientsData = useMemo(() => {
    const patients = {};
    
    filteredAppointments.forEach(app => {
      const patientName = app.referenceName?.trim() || app.patientName;
      
      if (!patients[patientName]) {
        patients[patientName] = {
          name: patientName,
          appointments: [],
          totalValue: 0,
          statusCounts: {}
        };
      }
      
      patients[patientName].appointments.push(app);
      patients[patientName].totalValue += app.value || 0;
      patients[patientName].statusCounts[app.status] = 
        (patients[patientName].statusCounts[app.status] || 0) + 1;
    });

    return Object.values(patients).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }, [filteredAppointments]);

  // Expandir/colapsar todos
  const toggleAll = useCallback((expand) => {
    if (expand) {
      setExpandedPatients(new Set(patientsData.map(p => p.name)));
    } else {
      setExpandedPatients(new Set());
    }
  }, [patientsData]);

  if (loading || loadingData) {
    return (
      <div className="todos-appointments-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  const totalAppointments = filteredAppointments.length;
  const totalValue = filteredAppointments.reduce((sum, app) => sum + (app.value || 0), 0);

  return (
    <div className="todos-appointments-container">
      <header className="page-header">
        <div>
          <h2>Todos os Agendamentos</h2>
          <p className="subtitle">
            {totalAppointments} agendamento{totalAppointments !== 1 ? 's' : ''} • 
            Total: <strong>R$ {totalValue.toFixed(2)}</strong>
          </p>
        </div>
      </header>

      {/* 🔹 Filtros */}
      <div className="filters-section">
        <div className="filters-row">
          <input
            type="search"
            placeholder="🔍 Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="Todos">📋 Todos</option>
            <option value="Confirmado">✅ Confirmado</option>
            <option value="Pendente">⏳ Pendente</option>
            <option value="Não Compareceu">❌ Não Compareceu</option>
            <option value="Msg enviada">💬 Msg enviada</option>
          </select>
        </div>

        <div className="filters-row">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="date-input"
            placeholder="Data inicial"
          />
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="date-input"
            placeholder="Data final"
          />
          
          <button className="btn-secondary" onClick={resetFilters}>
            🔄 Resetar
          </button>
        </div>

        <div className="filters-row">
          <button className="btn-link" onClick={() => toggleAll(true)}>
            ▼ Expandir Todos
          </button>
          <button className="btn-link" onClick={() => toggleAll(false)}>
            ▲ Colapsar Todos
          </button>
        </div>
      </div>

      {/* 🔹 Lista de pacientes */}
      <div className="patients-list">
        {patientsData.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>Nenhum agendamento encontrado</p>
            <button className="btn-secondary" onClick={resetFilters}>
              Limpar filtros
            </button>
          </div>
        ) : (
          patientsData.map(patient => {
            const isExpanded = expandedPatients.has(patient.name);

            return (
              <div key={patient.name} className="patient-card">
                <button 
                  className="patient-header" 
                  onClick={() => togglePatient(patient.name)}
                  aria-expanded={isExpanded}
                >
                  <div className="patient-info">
                    <span className="patient-name">{patient.name}</span>
                    <span className="patient-stats">
                      {patient.appointments.length} consulta{patient.appointments.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="patient-meta">
                    <span className="patient-total">R$ {patient.totalValue.toFixed(2)}</span>
                    <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="appointments-container">
                    {patient.appointments.map(app => (
                      <div
                        key={app.id}
                        className={`appointment-card ${changedIds.has(app.id) ? 'changed' : ''}`}
                        data-status={app.status}
                      >
                        <div className="appointment-main">
                          <div className="appointment-datetime">
                            <span className="date">📅 {formatDate(app.date)}</span>
                            <span className="time">🕐 {app.time}</span>
                          </div>
                          <div className="appointment-contact">
                            <span className="phone">📱 {app.patientWhatsapp}</span>
                          </div>
                          <div className="appointment-value">
                            <span className="value">💰 R$ {(app.value || 0).toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="appointment-status">
                          <select
                            value={app.status}
                            onChange={e => handleStatusChange(app.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="Pendente">⏳ Pendente</option>
                            <option value="Confirmado">✅ Confirmado</option>
                            <option value="Não Compareceu">❌ Não Compareceu</option>
                            <option value="Msg enviada">💬 Msg enviada</option>
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

      {/* 🔹 Botão salvar (fixo no bottom) */}
      {changedIds.size > 0 && (
        <div className="save-bar">
          <div className="save-bar-content">
            <span className="changes-count">
              {changedIds.size} alteraç{changedIds.size !== 1 ? 'ões' : 'ão'} não salva{changedIds.size !== 1 ? 's' : ''}
            </span>
            <button 
              className="btn-primary" 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? '💾 Salvando...' : '💾 Salvar Alterações'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}