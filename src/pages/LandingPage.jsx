// ============================================
// 📁 src/pages/LandingPage.jsx - REFATORADO
// ============================================
import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useLandingPage } from "../hooks/common/useLandingPage";
import Header from "../components/layout/Header/Header";
import HeroSection from "../components/landing/HeroSection";
import ProblemSection from "../components/landing/ProblemSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import PricingSection from "../components/landing/PricingSection";
import Footer from "../components/landing/Footer";

import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading, userPlan, handleProClick, scrollToPlans } = useLandingPage();

  return (
    <div className="landing-page">
      <Header user={user} />

      <HeroSection onScrollToPlans={scrollToPlans} />
      <ProblemSection />
      <FeaturesSection />
      <PricingSection 
        user={user}
        userPlan={userPlan}
        loading={loading}
        onProClick={handleProClick}
        onNavigateToRegister={() => navigate("/register")}
      />
      
      <Footer />
    </div>
  );
}