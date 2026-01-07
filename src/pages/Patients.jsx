import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc
} from "firebase/firestore";
import "./Patients.css";

export default function Patients() {
  const [user] = useAuthState(auth);
  const [patients, setPatients] = useState({});
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchPatients = async () => {
      // 1️⃣ Buscar consultas
      const apptSnap = await getDocs(
        query(
          collection(db, "appointments"),
          where("doctorId", "==", user.uid)
        )
      );

      const map = {};

      apptSnap.docs.forEach(doc => {
        const a = doc.data();
        const key = a.patientWhatsapp;

        if (!map[key]) {
          map[key] = {
            name: a.patientName,
            whatsapp: a.patientWhatsapp,
            totalConsultas: 0,
            price: 0
          };
        }

        map[key].totalConsultas += 1;
      });

      // 2️⃣ Buscar pacientes (preços)
      const patientSnap = await getDocs(
        query(
          collection(db, "patients"),
          where("doctorId", "==", user.uid)
        )
      );

      patientSnap.docs.forEach(doc => {
        const p = doc.data();
        if (map[p.whatsapp]) {
          map[p.whatsapp].price = p.price || 0;
        }
      });

      setPatients(map);
    };

    fetchPatients();
  }, [user]);

  const handlePriceChange = (whatsapp, value) => {
    setPatients(prev => ({
      ...prev,
      [whatsapp]: {
        ...prev[whatsapp],
        price: Number(value)
      }
    }));
  };

  const handleSavePrice = async (patient) => {
    setSaving(patient.whatsapp);

    try {
      const id = `${user.uid}_${patient.whatsapp}`;

      await setDoc(
        doc(db, "patients", id),
        {
          doctorId: user.uid,
          name: patient.name,
          whatsapp: patient.whatsapp,
          price: patient.price,
          updatedAt: new Date()
        },
        { merge: true }
      );

      alert(`Valor salvo para ${patient.name}`);
    } catch (err) {
      console.error("Erro ao salvar valor:", err);
      alert("Erro ao salvar valor.");
    } finally {
      setSaving(null);
    }
  };

  const list = Object.values(patients);

  return (
    <div className="patients-container">
      <h2>Pacientes</h2>

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
                <td>{p.name}</td>
                <td className="whatsapp">{p.whatsapp}</td>

                <td>
                  <input
                    type="number"
                    min="0"
                    value={p.price}
                    onChange={(e) =>
                      handlePriceChange(p.whatsapp, e.target.value)
                    }
                  />
                </td>

                <td className="center">{p.totalConsultas}</td>

                <td className="total">
                  R$ {(p.price * p.totalConsultas).toFixed(2)}
                </td>

                <td>
                  <button
                    className="save-btn"
                    onClick={() => handleSavePrice(p)}
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
