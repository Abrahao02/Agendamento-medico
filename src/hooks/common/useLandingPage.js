import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase";
import { db } from "../../services/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { useStripeCheckout } from "../stripe/useStripeCheckout";

export function useLandingPage() {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [userPlan, setUserPlan] = useState("free");
  const [planLoading, setPlanLoading] = useState(true);
  const location = useLocation();
  const { handleCheckout } = useStripeCheckout();

  // Buscar plano do usuário no Firestore
  useEffect(() => {
    if (!user) {
      setUserPlan("free");
      setPlanLoading(false);
      return;
    }

    const fetchUserPlan = async () => {
      try {
        const doctorDoc = await getDoc(doc(db, "doctors", user.uid));
        if (doctorDoc.exists()) {
          const plan = doctorDoc.data().plan || "free";
          setUserPlan(plan);
        }
      } catch (error) {
        console.error("Erro ao buscar plano do usuário:", error);
      } finally {
        setPlanLoading(false);
      }
    };

    fetchUserPlan();
  }, [user]);

  useEffect(() => {
    if (location.hash === "#plans") {
      const plansSection = document.querySelector("#plans");
      if (plansSection) {
        plansSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  const handleProClick = async () => {
    if (!user) {
      navigate("/login", { state: { redirectTo: "pro" } });
      return;
    }

    if (userPlan === "pro") {
      alert("Você já é um usuário PRO! Acesse as configurações para gerenciar sua assinatura.");
      navigate("/dashboard/settings");
      return;
    }

    await handleCheckout();
  };

  const scrollToPlans = () => {
    document
      .getElementById("plans")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return {
    user,
    loading: loading || planLoading,
    userPlan,
    handleProClick,
    scrollToPlans,
  };
}