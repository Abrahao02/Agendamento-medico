// ============================================
// 📁 src/hooks/dashboard/useDashboardData.js
// Responsabilidade: Apenas fetch de dados
// ============================================

import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import {
  validateAvailability,
} from "../../utils/filters/availabilityFilters";
import {
  calculateMonthlyAppointmentsCount,
  checkLimitReached,
} from "../../utils/limits/calculateMonthlyLimit";
import { logError, logWarning } from "../../utils/logger/logger";

export const useDashboardData = () => {
  const user = auth.currentUser;

  if (!user) {
    logWarning("useDashboardData usado sem usuário autenticado");
  }

  const [doctorSlug, setDoctorSlug] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctorPlan, setDoctorPlan] = useState("free");
  const [isLimitReached, setIsLimitReached] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch doctor data and other data in parallel
        const [doctorSnapshot, appointmentsSnapshot, patientsSnapshot, availabilitySnapshot] = await Promise.all([
          getDoc(doc(db, "doctors", user.uid)),
          getDocs(query(collection(db, "appointments"), where("doctorId", "==", user.uid))),
          getDocs(query(collection(db, "patients"), where("doctorId", "==", user.uid))),
          getDocs(query(collection(db, "availability"), where("doctorId", "==", user.uid))),
        ]);

        // Update doctor data
        if (doctorSnapshot.exists()) {
          const doctorData = doctorSnapshot.data();
          setDoctorSlug(doctorData.slug || user.uid);
          setDoctorPlan(doctorData.plan || "free");
        }

        setAppointments(appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const patientsData = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPatients(patientsData);

        const availabilityData = availabilitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAvailability(validateAvailability(availabilityData, true));

        // Calculate limit
        const appointmentsData = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const count = calculateMonthlyAppointmentsCount(appointmentsData);
        const plan = doctorSnapshot.exists() ? (doctorSnapshot.data().plan || "free") : "free";
        setIsLimitReached(checkLimitReached(plan, count));
      } catch (error) {
        logError("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  return {
    loading: loadingData,
    doctorSlug,
    appointments,
    availability,
    patients,
    doctorPlan,
    isLimitReached,
  };
};
