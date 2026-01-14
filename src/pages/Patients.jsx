// ============================================
// 📁 src/pages/Patients.jsx - MELHORADO
// Botão fixo, modal e barra de pesquisa
// ============================================
import React, { useState, useMemo } from "react";
import { auth } from "../services/firebase";
import { usePatients } from "../hooks/patients/usePatients";
import { UserPlus, Search } from "lucide-react";
import PageHeader from "../components/common/PageHeader/PageHeader";
import PatientItem from "../components/patients/PatientItem/PatientItem";
import AddPatientModal from "../components/patients/AddPatientModal/AddPatientModal";

import "./Patients.css";

export default function Patients() {
  const user = auth.currentUser;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    updatePatientName,
    savePatient,
    addPatient,
    enableEditPatient,
    disableEditPatient,
    editingPatients,
    formatWhatsappDisplay,
    setError,
  } = usePatients(user);

  // Filtrar pacientes baseado no termo de busca
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patientsList;

    const search = searchTerm.toLowerCase().trim();
    return patientsList.filter((patient) => {
      const name = (patient.name || "").toLowerCase();
      const referenceName = (patient.referenceName || "").toLowerCase();
      const whatsapp = formatWhatsappDisplay(patient.whatsapp).toLowerCase();

      return (
        name.includes(search) ||
        referenceName.includes(search) ||
        whatsapp.includes(search)
      );
    });
  }, [patientsList, searchTerm, formatWhatsappDisplay]);

  const handleAddPatient = async () => {
    const result = await addPatient();
    if (result.success) {
      setIsModalOpen(false);
      alert("Paciente cadastrado com sucesso!");
    } else if (result.error && !error) {
      // Erro já é gerenciado pelo hook
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError("");
  };

  const handleEditPatient = (patient) => {
    enableEditPatient(patient.whatsapp);
  };

  const handleCancelEdit = (patient) => {
    disableEditPatient(patient.whatsapp);
  };

  const handlePatientFieldChange = (field, value, whatsapp) => {
    if (field === "price") {
      updatePatientPrice(whatsapp, value);
    } else if (field === "referenceName") {
      updatePatientReferenceName(whatsapp, value);
    } else if (field === "name") {
      updatePatientName(whatsapp, value);
    }
  };

  const handleSavePatient = async (patient) => {
    const result = await savePatient(patient);
    if (result.success) {
      alert(`Dados salvos para ${patient.name}`);
    } else {
      alert(`Erro ao salvar: ${result.error || "Tente novamente"}`);
    }
  };

  if (loading) return <div className="patients-container"><p>Carregando pacientes...</p></div>;

  return (
    <div className="patients-container">
      <PageHeader
        label="Gestão de Pacientes"
        title="Clientes"
        description={`Total de ${patientsCount} cliente(s) cadastrado(s)`}
      />

      {/* Barra de Pesquisa */}
      <div className="patients-search">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {searchTerm && filteredPatients.length > 0 && (
        <div className="patients-search-results">
          {filteredPatients.length} resultado(s) encontrado(s)
        </div>
      )}

      {filteredPatients.length === 0 ? (
        <div className="patients-empty">
          <p>
            {searchTerm
              ? "Nenhum paciente encontrado com o termo de busca."
              : "Nenhum paciente encontrado."}
          </p>
        </div>
      ) : (
        <div className="patients-list">
          {filteredPatients.map((patient) => {
            const isEditing = editingPatients[patient.whatsapp];
            const isSaving = saving === patient.whatsapp;

            return (
              <PatientItem
                key={patient.whatsapp}
                patient={patient}
                isEditing={isEditing}
                isSaving={isSaving}
                onEdit={() => handleEditPatient(patient)}
                onSave={() => handleSavePatient(patient)}
                onCancel={() => handleCancelEdit(patient)}
                onFieldChange={(field, value) => handlePatientFieldChange(field, value, patient.whatsapp)}
                formatWhatsappDisplay={formatWhatsappDisplay}
              />
            );
          })}
        </div>
      )}

      {/* Botão Fixo (FAB) */}
      <button
        className="fab-button"
        onClick={() => setIsModalOpen(true)}
        aria-label="Adicionar novo paciente"
      >
        <UserPlus size={24} />
      </button>

      {/* Modal de Adicionar Paciente */}
      <AddPatientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddPatient}
        newPatient={newPatient}
        updateNewPatientField={updateNewPatientField}
        handleWhatsappChange={handleWhatsappChange}
        isWhatsappDuplicate={isWhatsappDuplicate}
        error={error}
        loading={saving !== null}
      />
    </div>
  );
}