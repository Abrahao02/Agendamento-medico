import { useEffect, useState, useRef } from "react";
import { db } from "../services/firebase";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import "./PublicSchedule.css";
import formatDate from "../utils/formatDate";

export default function PublicSchedule() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientWhatsapp, setPatientWhatsapp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Ref para scroll suave
  const formRef = useRef(null);

  useEffect(() => {
    const fetchDoctorAndAvailability = async () => {
      setLoading(true);
      try {
        const doctorsRef = collection(db, "doctors");
        const q = query(doctorsRef, where("slug", "==", slug));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setDoctor(null);
          setAvailability([]);
          setLoading(false);
          return;
        }

        const docSnap = snapshot.docs[0];
        const doctorData = docSnap.data();
        const doctorId = docSnap.id;
        setDoctor({ ...doctorData, id: doctorId });

        const availabilityRef = collection(db, "availability");
        const availQuery = query(availabilityRef, where("doctorId", "==", doctorId));
        const availSnapshot = await getDocs(availQuery);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().slice(0, 10);
        const rawData = availSnapshot.docs.map(doc => ({
          id: doc.id,
          date: doc.data().date,
          slots: doc.data().slots || []
        }));
        console.log("Raw availability:", rawData);
        const data = rawData
          .filter(a => {
            const dateValid = a.date >= todayStr;
            const hasSlots = a.slots.length > 0;
            console.log(`Date ${a.date}: dateValid=${dateValid}, hasSlots=${hasSlots}, slots=${a.slots}`);
            return hasSlots && dateValid;
          })
          .sort((a, b) => a.date.localeCompare(b.date));

        console.log("Filtered data:", data);

        setAvailability(data);

      } catch (error) {
        console.error("Erro ao buscar disponibilidade:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorAndAvailability();
  }, [slug]);

  const handleDayClick = (day) => {
    setSelectedDay(selectedDay?.id === day.id ? null : day);
    setSelectedSlot(null);
    setPatientName("");
    setPatientWhatsapp("");
  };

  const handleSlotClick = (dayId, date, slot) => {
    setSelectedSlot({ dayId, date, time: slot });
    setPatientName("");
    setPatientWhatsapp("");

    // Scroll suave para o formulário
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();

    if (!patientName.trim()) {
      alert("Preencha seu nome completo.");
      return;
    }

    const whatsappNumbers = patientWhatsapp.replace(/\D/g, "");
    if (whatsappNumbers.length !== 11) {
      alert("Informe um número de WhatsApp válido com 11 dígitos (ex: 5511988888888).");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "appointments"), {
        doctorId: doctor.id,
        doctorSlug: doctor.slug,
        date: selectedSlot.date,
        time: selectedSlot.time,
        patientName,
        patientWhatsapp: whatsappNumbers,
        status: "Pendente",
        createdAt: new Date()
      });

      const availRef = doc(db, "availability", selectedSlot.dayId);
      await updateDoc(availRef, {
        slots: availability
          .find(a => a.id === selectedSlot.dayId)
          .slots.filter(s => s !== selectedSlot.time)
      });

      setAvailability(prev => prev.map(a => 
        a.id === selectedSlot.dayId 
          ? { ...a, slots: a.slots.filter(s => s !== selectedSlot.time) } 
          : a
      ));

      navigate(`/public/${slug}/success`, { state: { name: patientName, date: selectedSlot.date, time: selectedSlot.time } });

    } catch (err) {
      console.error("Erro ao agendar:", err);
      alert("Erro ao agendar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (!doctor) return <p>Médico não encontrado.</p>;

  return (
    <div className="public-schedule-container">
      <h2>Agendar com Dr(a). {doctor.name}</h2>
      <p className="instructions">
        Preencha o formulário abaixo para solicitar seu horário de atendimento.<br/>
        Após o envio, você receberá a confirmação pelo WhatsApp.
      </p>

      {availability.length === 0 && <p>Nenhum horário disponível.</p>}

      {/* Lista de dias disponíveis - horizontal */}
      <div className="days-list-horizontal">
        {availability.map(({ id, date, slots }) => (
          <div key={id} className="day-container-horizontal">
            <button
              className={`day-btn ${selectedDay?.id === id ? 'selected' : ''}`}
              onClick={() => handleDayClick({ id, date, slots })}
            >
              {formatDate(date)} — {slots.length} horário(s)
            </button>

            {selectedDay?.id === id && (
              <div className="day-slots-inline">
                {slots.map((slot, idx) => (
                  <button
                    key={idx}
                    className={`slot-btn ${selectedSlot?.time === slot ? 'selected' : ''}`}
                    onClick={() => handleSlotClick(id, date, slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Formulário */}
      {selectedSlot && (
        <div className="appointment-form" ref={formRef}>
          <h3>Agendar {formatDate(selectedSlot.date)} às {selectedSlot.time}</h3>
          <form onSubmit={handleSubmitAppointment}>
            <label>
              Nome completo:
              <input 
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
              />
            </label>
            <label>
              WhatsApp:
              <input 
                value={patientWhatsapp}
                onChange={e => setPatientWhatsapp(e.target.value)}
                placeholder="Ex: 5511988888888"
              />
            </label>
            <p className="privacy">
              As informações fornecidas serão utilizadas apenas para organização do agendamento e contato, respeitando a confidencialidade e a privacidade do paciente.
            </p>
            <button type="submit" disabled={submitting}>
              {submitting ? "Agendando..." : "Confirmar"}
            </button>
            <button type="button" onClick={() => setSelectedSlot(null)}>
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
