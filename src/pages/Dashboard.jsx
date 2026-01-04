import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import "./Dashboard.css";

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const [doctorName, setDoctorName] = useState("");
  const [doctorSlug, setDoctorSlug] = useState("");
  const [copied, setCopied] = useState(false);

  // Indicadores
  const [appointmentsMonth, setAppointmentsMonth] = useState(0);
  const [slotsOpen, setSlotsOpen] = useState(0);
  const [appointmentsConfirmed, setAppointmentsConfirmed] = useState(0);

  const navigate = useNavigate();

  // Redireciona caso não esteja logado
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Busca dados do médico no Firestore
  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "doctors", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setDoctorName(data.name || user.email);
          setDoctorSlug(data.slug);
        } else {
          setDoctorName(user.email);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do médico:", error);
      }
    };

    fetchDoctorData();
  }, [user]);

  // Busca os indicadores do médico
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");

        // 1️⃣ Pega todos os appointments do médico
        const appointmentsRef = collection(db, "appointments");
        const qAppointments = query(appointmentsRef, where("doctorId", "==", user.uid));
        const snapshotAppointments = await getDocs(qAppointments);
        const allAppointments = snapshotAppointments.docs.map(doc => doc.data());

        // Filtra apenas do mês atual
        const monthlyAppointments = allAppointments.filter(app => app.date.startsWith(`${year}-${month}`));
        setAppointmentsMonth(monthlyAppointments.length);

        // Horários confirmados
        const confirmed = monthlyAppointments.filter(app => app.status === "Confirmado").length;
        setAppointmentsConfirmed(confirmed);

        // 2️⃣ Horários livres (availability)
        const availabilityRef = collection(db, "availability");
        const qAvail = query(availabilityRef, where("doctorId", "==", user.uid));
        const snapshotAvail = await getDocs(qAvail);
        const totalOpen = snapshotAvail.docs.reduce((sum, doc) => sum + (doc.data().slots?.length || 0), 0);
        setSlotsOpen(totalOpen);

      } catch (error) {
        console.error("Erro ao buscar indicadores:", error);
      }
    };

    fetchStats();
  }, [user]);

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Copiar link público
  const handleCopyLink = () => {
    if (!doctorSlug) return;
    navigator.clipboard.writeText(`${window.location.origin}/public/${doctorSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="dashboard-container">
      <h2>Bem-vindo(a), {doctorName}!</h2>

      {/* Link público */}
      <div className="public-link-card">
        <p>Compartilhe este link com seus pacientes:</p>
        <div className="link-box">
          <span>{`${window.location.origin}/public/${doctorSlug}`}</span>
          <button onClick={handleCopyLink}>{copied ? "✔ Copiado!" : "📋 Copiar"}</button>
        </div>
      </div>

      {/* Indicadores */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>{appointmentsMonth}</h3>
          <p>Atendimentos no mês</p>
        </div>
        <div className="stat-card">
          <h3>{slotsOpen}</h3>
          <p>Horários abertos</p>
        </div>
        <div className="stat-card">
          <h3>{appointmentsConfirmed}</h3>
          <p>Horários confirmados</p>
        </div>
      </div>

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout}>
        🚪 Logout
      </button>
    </div>
  );
}
