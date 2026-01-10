import React, { useEffect } from "react";
import { auth } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { usePatients } from "../hooks/patients/usePatients";

import "./Patients.css";

export default function Patients() {
  const [user, authLoading] = useAuthState(auth);
  const navigate = useNavigate();

  const {
    loading,
    saving,
    newPatient,
    error,
    patientsList,
    patientsCount,
    updateNewPatientField,
    handleWhatsappChange,
    isWhatsappDuplicate,
    updatePatientPrice,
    updatePatientReferenceName,
    savePatient,
    addPatient,
    formatWhatsappDisplay,
    setError,
  } = usePatients(user);

  // 🔐 Proteção de rota
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // ➕ Handler de adicionar paciente
  const handleAddPatient = async () => {
    const result = await addPatient();

    if (result.success) {
      alert("Paciente cadastrado com sucesso!");
    } else if (result.error && !error) {
      // Se o hook não setou erro, mostramos alerta
      alert(`Erro: ${result.error}`);
    }
  };

  // 💾 Handler de salvar paciente
  const handleSavePatient = async (patient) => {
    const result = await savePatient(patient);

    if (result.success) {
      alert(`Dados salvos para ${patient.name}`);
    } else {
      alert(`Erro ao salvar: ${result.error || "Tente novamente"}`);
    }
  };

  // 🔄 Loading state
  if (authLoading || loading) {
    return (
      <div className="patients-container">
        <p>Carregando pacientes...</p>
      </div>
    );
  }

  return (
    <div className="patients-container">
      <h2>Clientes</h2>

      {/* 🔹 Formulário de cadastro */}
      <div className="add-patient-form">
        <h3>Adicionar Novo Paciente</h3>

        <input
          type="text"
          placeholder="Nome"
          value={newPatient.name}
          onChange={(e) => updateNewPatientField("name", e.target.value)}
        />

        <input
          type="text"
          placeholder="Nome de referência"
          value={newPatient.referenceName}
          onChange={(e) =>
            updateNewPatientField("referenceName", e.target.value)
          }
        />

        <input
          type="text"
          placeholder="WhatsApp (DDD + número)"
          value={newPatient.whatsapp}
          onChange={(e) => handleWhatsappChange(e.target.value)}
          className={
            isWhatsappDuplicate(newPatient.whatsapp) ? "input-error" : ""
          }
        />

        <input
          type="number"
          min="0"
          placeholder="Valor da Consulta"
          value={newPatient.price}
          onChange={(e) => updateNewPatientField("price", e.target.value)}
        />

        <button onClick={handleAddPatient}>Cadastrar Paciente</button>

        {error && <p className="error">{error}</p>}
      </div>

      {/* 📊 Total de clientes */}
      <div className="patients-total">
        Total de Clientes: <strong>{patientsCount}</strong>
      </div>

      {/* 📋 Lista de pacientes */}
      {patientsList.length === 0 ? (
        <p>Nenhum paciente encontrado.</p>
      ) : (
        <table className="patients-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>WhatsApp</th>
              <th>Valor Consulta (R$)</th>
              <th>Total Consultas</th>
              <th>Total (R$)</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {patientsList.map((patient) => (
              <tr key={patient.whatsapp}>
                <td>
                  {patient.name}
                  <input
                    type="text"
                    placeholder="Nome de referência"
                    value={patient.referenceName}
                    onChange={(e) =>
                      updatePatientReferenceName(
                        patient.whatsapp,
                        e.target.value
                      )
                    }
                    style={{ marginTop: "4px", width: "100%" }}
                  />
                </td>

                <td className="whatsapp">
                  {formatWhatsappDisplay(patient.whatsapp)}
                </td>

                <td>
                  <input
                    type="number"
                    min="0"
                    value={patient.price}
                    onChange={(e) =>
                      updatePatientPrice(patient.whatsapp, e.target.value)
                    }
                  />
                </td>

                <td className="center">{patient.totalConsultas}</td>

                <td className="total">
                  R$ {(patient.price * patient.totalConsultas).toFixed(2)}
                </td>

                <td>
                  <button
                    className="save-btn"
                    onClick={() => handleSavePatient(patient)}
                    disabled={saving === patient.whatsapp}
                  >
                    {saving === patient.whatsapp ? "Salvando..." : "Salvar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}