// ============================================
// 📁 src/hooks/layout/useDashboardLayout.js - NOVO
// ============================================
import { useState, useEffect, useCallback } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";

const APPOINTMENT_LIMIT = 10;

/**
 * Hook para gerenciar sidebar responsiva
 */
function useSidebarState() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      if (!desktop) setSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return { sidebarOpen, isDesktop, toggleSidebar, closeSidebar };
}

/**
 * Hook para gerenciar dados do usuário e plano
 */
function useUserData() {
  const [doctorName, setDoctorName] = useState("");
  const [plan, setPlan] = useState("free");
  const [appointmentsThisMonth, setAppointmentsThisMonth] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const loadUserData = async () => {
      setLoading(true);
      try {
        const doctorDoc = await getDoc(doc(db, "doctors", user.uid));

        if (doctorDoc.exists()) {
          const data = doctorDoc.data();
          setDoctorName(data.name || user.email);
          setPlan(data.plan || "free");

          // Calcular consultas do mês
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, "0");
          const startDate = `${year}-${month}-01`;
          const endDate = `${year}-${month}-31`;

          const appointmentsSnapshot = await getDocs(
            query(
              collection(db, "appointments"),
              where("doctorId", "==", user.uid)
            )
          );

          const appointments = appointmentsSnapshot.docs.map(d => d.data());
          const confirmedThisMonth = appointments.filter(
            appointment =>
              appointment.status === "Confirmado" &&
              appointment.date >= startDate &&
              appointment.date <= endDate
          ).length;

          setAppointmentsThisMonth(confirmedThisMonth);

          const userPlan = data.plan || "free";
          setIsLimitReached(
            userPlan === "free" && confirmedThisMonth >= APPOINTMENT_LIMIT
          );
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  return { doctorName, plan, appointmentsThisMonth, isLimitReached, loading };
}

/**
 * Hook principal do DashboardLayout
 */
export function useDashboardLayout() {
  const sidebar = useSidebarState();
  const userData = useUserData();

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }, []);

  return {
    ...sidebar,
    ...userData,
    handleLogout,
  };
}