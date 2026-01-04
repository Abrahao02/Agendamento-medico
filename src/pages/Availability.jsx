import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import "./Availability.css";

export default function Availability() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Buscar slots do dia selecionado
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user || !date) return;

      try {
        const docId = `${user.uid}_${date}`;
        const availabilityRef = doc(db, "availability", docId);
        const docSnap = await getDoc(availabilityRef);

        if (docSnap.exists()) {
          setSlots(docSnap.data().slots || []);
        } else {
          setSlots([]);
        }
      } catch (err) {
        console.error("Erro ao buscar disponibilidade:", err);
      }
    };
    fetchAvailability();
  }, [user, date]);

  const handleAddSlot = () => setSlots([...slots, ""]);

  const handleChangeSlot = (index, value) => {
    const newSlots = [...slots];
    newSlots[index] = value;
    setSlots(newSlots);
  };

  const handleRemoveSlot = (index) => {
    const newSlots = slots.filter((_, i) => i !== index);
    setSlots(newSlots);
  };

  const handleSave = async () => {
    if (!date) return setError("Selecione uma data");

    // Checa slots duplicados ou vazios
    const uniqueSlots = Array.from(new Set(slots.filter(s => s)));
    if (uniqueSlots.length !== slots.filter(s => s).length) {
      return setError("Existem horários duplicados ou vazios!");
    }

    try {
      const docId = `${user.uid}_${date}`;
      const availabilityRef = doc(db, "availability", docId);

      await setDoc(availabilityRef, {
        doctorId: user.uid,
        date,
        slots: uniqueSlots,
      });

      setError("");
      alert("Disponibilidade salva com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar disponibilidade:", err);
      setError("Erro ao salvar. Tente novamente.");
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="availability-container">
      <h2>Definir Disponibilidade</h2>

      <label className="date-label">
        Selecione a data:
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      {error && <p className="error">{error}</p>}

      <div className="slots-container">
        {slots.map((slot, i) => (
          <div key={i} className="slot-input">
            <input
              type="time"
              value={slot}
              onChange={(e) => handleChangeSlot(i, e.target.value)}
              className={slot ? "filled" : "empty"}
            />
            <button type="button" onClick={() => handleRemoveSlot(i)}>
              ❌
            </button>
          </div>
        ))}
      </div>

      <div className="slots-actions">
        <button type="button" onClick={handleAddSlot}>+ Adicionar horário</button>
        <button type="button" className="submit-btn" onClick={handleSave}>
          Salvar Disponibilidade
        </button>
      </div>
    </div>
  );
}
