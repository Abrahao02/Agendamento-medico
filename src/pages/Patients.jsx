// ============================================
// 📁 src/pages/Patients.jsx - REFATORADO
// ============================================
import React from "react";
import { auth } from "../services/firebase";
import { usePatients } from "../hooks/patients/usePatients";

import "./Patients.css";

export default function Patients() {
  const user = auth.currentUser;

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
    enableEditPatient,
    editingPatients,
    formatWhatsappDisplay,
    setError,
  } = usePatients(user);

  const handleAddPatient = async () => {
    const result = await addPatient();
    if (result.success) alert("Paciente cadastrado com sucesso!");
    else if (result.error && !error) alert(`Erro: ${result.error}`);
  };

  const handleSavePatient = async (patient) => {
    const result = await savePatient(patient);
    if (result.success) alert(`Dados salvos para ${patient.name}`);
    else alert(`Erro ao salvar: ${result.error || "Tente novamente"}`);
  };

  if (loading) return <div className="patients-container"><p>Carregando pacientes...</p></div>;

  return (
    <div className="patients-container">
      <h2>Clientes</h2>

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
          onChange={(e) => updateNewPatientField("referenceName", e.target.value)}
        />

        <input
          type="text"
          placeholder="WhatsApp (DDD + número)"
          value={newPatient.whatsapp}
          onChange={(e) => handleWhatsappChange(e.target.value)}
          className={isWhatsappDuplicate(newPatient.whatsapp) ? "input-error" : ""}
        />

        <input
          type="number"
          min="0"
          placeholder="Valor da consulta"
          value={newPatient.price}
          onChange={(e) => updateNewPatientField("price", e.target.value)}
        />

        <button onClick={handleAddPatient}>Cadastrar Paciente</button>

        {error && <p className="error">{error}</p>}
      </div>

      <div className="patients-total">
        Total de Clientes: <strong>{patientsCount}</strong>
      </div>

      {patientsList.length === 0 ? (
        <p>Nenhum paciente encontrado.</p>
      ) : (
        <table className="patients-table">
          <thead>
            <tr>
              <th>Nome Completo</th>
              <th>Nome Preferido</th>
              <th>WhatsApp</th>
              <th>Valor Consulta (R$)</th>
              <th>Total Consultas</th>
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>
            {patientsList.map((patient) => {
              const isEditing = editingPatients[patient.whatsapp];

              return (
                <tr key={patient.whatsapp}>
                  <td data-label="Nome Completo">
                    <input
                      type="text"
                      value={patient.name}
                      onChange={(e) => updateNewPatientField("name", e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>

                  <td data-label="Nome Preferido">
                    <input
                      type="text"
                      value={patient.referenceName}
                      onChange={(e) => updatePatientReferenceName(patient.whatsapp, e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>

                  <td data-label="WhatsApp" className="whatsapp">{formatWhatsappDisplay(patient.whatsapp)}</td>

                  <td data-label="Valor Consulta (R$)">
                    <input
                      type="number"
                      min="0"
                      value={patient.price}
                      onChange={(e) => updatePatientPrice(patient.whatsapp, e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>

                  <td data-label="Total Consultas" className="center">{patient.totalConsultas}</td>

                  <td data-label="Ação">
                    {!isEditing ? (
                      <button className="edit-btn" onClick={() => enableEditPatient(patient.whatsapp)}>Editar</button>
                    ) : (
                      <button
                        className="save-btn"
                        onClick={() => handleSavePatient(patient)}
                        disabled={saving === patient.whatsapp}
                      >
                        {saving === patient.whatsapp ? "Salvando..." : "Salvar"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}