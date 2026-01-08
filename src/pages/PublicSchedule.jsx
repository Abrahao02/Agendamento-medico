import { useEffect, useState, useRef } from "react";
import { db } from "../services/firebase";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import "./PublicSchedule.css";
import formatDate from "../utils/formatDate";

// Máscara WhatsApp (21) 99999-0000
const formatWhatsapp = (value) => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

export default function PublicSchedule() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsThisMonth, setAppointmentsThisMonth] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientWhatsapp, setPatientWhatsapp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formRef = useRef(null);

  // 🔹 Fetch doctor + availability + limite
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "doctors"), where("slug", "==", slug));
        const snap = await getDocs(q);
        if (snap.empty) return;
        const doctorDoc = snap.docs[0];
        const doctorData = { id: doctorDoc.id, ...doctorDoc.data() };
        setDoctor(doctorData);

        // Limite de agendamentos do mês
        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const currentMonth = now.toISOString().slice(0, 7);

        const appSnap = await getDocs(
          query(collection(db, "appointments"), where("doctorId", "==", doctorData.id))
        );
        const attendedThisMonth = appSnap.docs.filter(doc => {
          const a = doc.data();
          return a.status === "Confirmado" &&
            a.date?.startsWith(currentMonth) &&
            a.date < today;
        }).length;

        setAppointmentsThisMonth(attendedThisMonth);
        const limit = doctorData.monthlyLimit || 10;
        setLimitReached(doctorData.plan === "free" && attendedThisMonth >= limit);

        // Disponibilidade
        const availSnap = await getDocs(
          query(collection(db, "availability"), where("doctorId", "==", doctorData.id))
        );

        const data = availSnap.docs
          .map(doc => ({ id: doc.id, date: doc.data().date, slots: doc.data().slots || [] }))
          .filter(a => a.slots.length > 0 && a.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date));

        setAvailability(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();

    if (!patientName.trim()) {
      alert("Preencha seu nome completo.");
      return;
    }

    const whatsappNumbers = patientWhatsapp.replace(/\D/g, "");
    if (whatsappNumbers.length !== 11) {
      alert("Informe um número de WhatsApp válido com 11 dígitos (ex: 11988888888).");
      return;
    }

    setSubmitting(true);
    try {
      const patientId = `${doctor.id}_${whatsappNumbers}`;
      const patientRef = doc(db, "patients", patientId);

      const patientSnap = await getDocs(
        query(
          collection(db, "patients"),
          where("doctorId", "==", doctor.id),
          where("whatsapp", "==", whatsappNumbers)
        )
      );

      let appointmentValue = doctor.defaultValueSchedule || 0;

      if (patientSnap.empty) {
        await setDoc(patientRef, {
          doctorId: doctor.id,
          name: patientName,
          whatsapp: whatsappNumbers,
          price: doctor.defaultValueSchedule,
          createdAt: serverTimestamp(),
        });
      } else {
        const existingPatient = patientSnap.docs[0].data();
        if (existingPatient.price && existingPatient.price > 0) {
          appointmentValue = existingPatient.price;
        }
      }

      // 🔹 Cria o agendamento
      await addDoc(collection(db, "appointments"), {
        doctorId: doctor.id,
        doctorSlug: doctor.slug,
        patientId,
        date: selectedSlot.date,
        time: selectedSlot.time,
        patientName,
        patientWhatsapp: whatsappNumbers,
        value: appointmentValue,
        status: "Pendente",
        createdAt: serverTimestamp()
      });

      // 🔹 Atualiza disponibilidade
      const availRef = doc(db, "availability", selectedSlot.dayId);
      await updateDoc(availRef, {
        slots: availability.find(a => a.id === selectedSlot.dayId).slots.filter(s => s !== selectedSlot.time)
      });

      setAvailability(prev => prev.map(a =>
        a.id === selectedSlot.dayId ? { ...a, slots: a.slots.filter(s => s !== selectedSlot.time) } : a
      ));

      // 🔹 Disparo de e-mail
      const formData = new URLSearchParams();
      formData.append("to", doctor.email);
      formData.append("subject", `Novo agendamento com ${patientName}`);
      formData.append("body",
        `Olá ${doctor.name},\n\nVocê tem um novo agendamento:\n\nPaciente: ${patientName}\nWhatsApp: ${whatsappNumbers}\nData: ${selectedSlot.date}\nHora: ${selectedSlot.time}\nValor: ${appointmentValue}\n\nNão esqueça de entrar em contato com o paciente para confirmar a consulta!`
      );
      formData.append("htmlBody", `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #1D4ED8;">Novo agendamento!</h2>
          <p>Olá <b>${doctor.name}</b>,</p>
          <p>Você tem um novo agendamento no seu aplicativo:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 1em 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Paciente:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${patientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>WhatsApp:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${whatsappNumbers}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Data:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${selectedSlot.date}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Hora:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${selectedSlot.time}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Valor:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd; color: #16A34A;"><b>${appointmentValue}</b></td>
            </tr>
          </table>
          <p style="background-color: #FEF3C7; padding: 10px; border-left: 5px solid #F59E0B;">
            ⚠️ Não esqueça de entrar em contato com o paciente para confirmar a consulta!
          </p>
          <p>Atenciosamente,<br/><b>Equipe do App de Agendamento</b></p>
        </div>
      `);
      const emailEndpoint = import.meta.env.VITE_APPS_SCRIPT_URL;
      if (!emailEndpoint) throw new Error("Endpoint de e-mail não configurado");
      await fetch(emailEndpoint, { method: "POST", body: formData });

      // 🔹 Redireciona
      navigate(`/public/${slug}/success`, {
        state: { name: patientName, date: selectedSlot.date, time: selectedSlot.time }
      });

    } catch (err) {
      console.error(err);
      alert("Erro ao agendar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (!doctor) return <p>Médico não encontrado.</p>;

  return (
    <div className="public-schedule-container">
      <h2>Marque sua consulta com {doctor.name}</h2>

      <div className="intro-message">
        ⏱️ Agende sua consulta de forma rápida e segura!<br />
        Escolha um horário disponível abaixo e preencha seus dados para confirmar.
      </div>

      {limitReached && (
        <div className="booking-blocked">
          <h3>Agenda cheia este mês</h3>
          <p>Todos os horários foram preenchidos. Entre em contato pelo WhatsApp para verificar novas datas:</p>
          <strong className="whatsapp">{doctor.whatsapp}</strong>
        </div>
      )}

      {availability.length === 0 && !limitReached && <p>Nenhum horário disponível no momento.</p>}

      <div className="days-list">
        {availability.map(({ id, date, slots }) => (
          <div key={id} className="day-card">
            <button
              className={`day-btn ${selectedDay?.id === id ? 'selected' : ''}`}
              disabled={limitReached}
              onClick={() => handleDayClick({ id, date, slots })}
            >
              {formatDate(date)} — {slots.length} horário(s)
              <span className="arrow">{selectedDay?.id === id ? "▲" : "▼"}</span>
            </button>

            {selectedDay?.id === id && (
              <div className="slots-list">
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

      {selectedSlot && (
        <div className="appointment-form" ref={formRef}>
          <h3>Agendando para {formatDate(selectedSlot.date)} às {selectedSlot.time}</h3>
          <form onSubmit={handleSubmitAppointment}>
            <label>
              Nome completo:
              <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Ex: João da Silva" />
            </label>
            <label>
              WhatsApp:
              <div className="phone-input-wrapper">
                <span>+55</span>
                <input
                  value={patientWhatsapp}
                  onChange={e => setPatientWhatsapp(formatWhatsapp(e.target.value))}
                  placeholder="11 98888-8888"
                />
              </div>
            </label>


            <p className="privacy">
              Seus dados serão usados apenas para controle de agendamento.
            </p>
            <div className="form-buttons">
              <button type="submit" disabled={submitting}>{submitting ? "Agendando..." : "Confirmar consulta"}</button>
              <button type="button" onClick={() => setSelectedSlot(null)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
