import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import "./Patients.css";

export default function Patients() {
  const [user] = useAuthState(auth);
  const [patients, setPatients] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [saving, setSaving] = useState(null);
  const [newPatient, setNewPatient] = useState({ name: "", referenceName: "", whatsapp: "", price: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Carregar pacientes e consultas
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const appSnap = await getDocs(
          query(collection(db, "appointments"), where("doctorId", "==", user.uid))
        );
        const appointmentsData = appSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAppointments(appointmentsData);

        const patientSnap = await getDocs(
          query(collection(db, "patients"), where("doctorId", "==", user.uid))
        );
        const map = {};
        patientSnap.docs.forEach(d => {
          const p = d.data();
          map[p.whatsapp] = {
            id: d.id,
            name: p.name,
            referenceName: p.referenceName || "",
            whatsapp: p.whatsapp,
            price: p.price || 0,
            totalConsultas: 0
          };
        });

        appointmentsData.forEach(app => {
          const key = app.patientWhatsapp || app.patientId;
          if (map[key]) map[key].totalConsultas += 1;
        });

        setPatients(map);
      } catch (err) {
        console.error("Erro ao carregar pacientes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // 🔹 Alterar preço
  const handlePriceChange = (whatsapp, value) => {
    setPatients(prev => ({
      ...prev,
      [whatsapp]: { ...prev[whatsapp], price: Number(value) }
    }));
  };

  // 🔹 Alterar nome de referência
  const handleReferenceNameChange = (whatsapp, value) => {
    setPatients(prev => ({
      ...prev,
      [whatsapp]: { ...prev[whatsapp], referenceName: value }
    }));
  };

  // 🔹 Salvar paciente (nome, referência e preço)
  const handleSavePatient = async (patient) => {
    setSaving(patient.whatsapp);
    try {
      const id = patient.id || `${user.uid}_${patient.whatsapp}`;
      await setDoc(
        doc(db, "patients", id),
        {
          doctorId: user.uid,
          name: patient.name,
          referenceName: patient.referenceName || "",
          whatsapp: patient.whatsapp,
          price: patient.price,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      alert(`Dados salvos para ${patient.name}`);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar dados.");
    } finally {
      setSaving(null);
    }
  };

  // 🔹 Máscara WhatsApp simplificada
  const handleWhatsappChange = (value) => {
    let numbers = value.replace(/\D/g, "").slice(0, 11);
    let formatted = "";
    if (numbers.length > 0) formatted += `(${numbers.slice(0, 2)})`; // DDD
    if (numbers.length > 2) formatted += ` ${numbers.slice(2, 7)}`;   // 5 primeiros dígitos
    if (numbers.length > 7) formatted += `-${numbers.slice(7, 11)}`;  // últimos dígitos
    setNewPatient(prev => ({ ...prev, whatsapp: formatted }));
  };

  const isWhatsappDuplicate = (wpp) => {
    const numbers = wpp.replace(/\D/g, "");
    return patients[numbers] !== undefined;
  };

  // 🔹 Cadastrar novo paciente
  const handleAddPatient = async () => {
    setError("");

    const name = newPatient.name.trim();
    const referenceName = newPatient.referenceName.trim();
    const price = Number(newPatient.price || 0);
    const numbers = newPatient.whatsapp.replace(/\D/g, "");

    if (!name) {
      setError("Nome obrigatório.");
      return;
    }
    if (numbers.length < 10 || numbers.length > 11) {
      setError("WhatsApp inválido. Digite DDD + número (10 a 11 dígitos).");
      return;
    }
    if (isWhatsappDuplicate(numbers)) {
      setError("WhatsApp já cadastrado.");
      return;
    }
    if (isNaN(price) || price < 0) {
      setError("Preço inválido.");
      return;
    }

    try {
      const id = `${user.uid}_${numbers}`;
      await setDoc(doc(db, "patients", id), {
        doctorId: user.uid,
        name,
        referenceName,
        whatsapp: numbers,
        price,
        createdAt: serverTimestamp()
      });

      setPatients(prev => ({
        ...prev,
        [numbers]: { id, name, referenceName, whatsapp: numbers, price, totalConsultas: 0 }
      }));

      setNewPatient({ name: "", referenceName: "", whatsapp: "", price: "" });
      setError("");
      alert("Paciente cadastrado com sucesso!");
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar paciente.");
    }
  };

  const list = Object.values(patients).sort((a, b) => a.name.localeCompare(b.name));

  if (loading) return <p>Carregando pacientes...</p>;

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
          onChange={e => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Nome de referência"
          value={newPatient.referenceName}
          onChange={e => setNewPatient(prev => ({ ...prev, referenceName: e.target.value }))}
        />
        <input
          type="text"
          placeholder="WhatsApp (DDD + número)"
          value={newPatient.whatsapp}
          onChange={e => handleWhatsappChange(e.target.value)}
          className={isWhatsappDuplicate(newPatient.whatsapp) ? "input-error" : ""}
        />
        <input
          type="number"
          min="0"
          placeholder="Valor da Consulta"
          value={newPatient.price}
          onChange={e => setNewPatient(prev => ({ ...prev, price: e.target.value }))}
        />
        <button onClick={handleAddPatient}>Cadastrar Paciente</button>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="patients-total">
        Total de Clientes: <strong>{list.length}</strong>
      </div>

      {list.length === 0 ? (
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
            {list.map(p => (
              <tr key={p.whatsapp}>
                <td>
                  {p.name}
                  <input
                    type="text"
                    placeholder="Nome de referência"
                    value={p.referenceName}
                    onChange={e => handleReferenceNameChange(p.whatsapp, e.target.value)}
                    style={{ marginTop: "4px", width: "100%" }}
                  />
                </td>
                <td className="whatsapp">{`(${p.whatsapp.slice(0,2)}) ${p.whatsapp.slice(2,7)}-${p.whatsapp.slice(7,11)}`}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={p.price}
                    onChange={e => handlePriceChange(p.whatsapp, e.target.value)}
                  />
                </td>
                <td className="center">{p.totalConsultas}</td>
                <td className="total">R$ {(p.price * p.totalConsultas).toFixed(2)}</td>
                <td>
                  <button
                    className="save-btn"
                    onClick={() => handleSavePatient(p)}
                    disabled={saving === p.whatsapp}
                  >
                    {saving === p.whatsapp ? "Salvando..." : "Salvar"}
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
