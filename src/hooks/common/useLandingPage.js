// ============================================
// 📁 src/hooks/landing/useLandingPage.js - NOVO
// ============================================
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export function useLandingPage() {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const location = useLocation();

  // Scroll automático para seção de planos
  useEffect(() => {
    if (location.hash === "#plans") {
      const plansSection = document.querySelector("#plans");
      if (plansSection) {
        plansSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  const handleProClick = () => {
    if (!user) {
      navigate("/login", { state: { redirectTo: "pro" } });
      return;
    }

    if (user.plan === "pro") {
      alert("Você já é PRO!");
      return;
    }

    window.open("https://mpago.la/1TYVDfE", "_blank");
  };

  const scrollToPlans = () => {
    document
      .getElementById("plans")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return {
    user,
    loading,
    handleProClick,
    scrollToPlans,
  };
}