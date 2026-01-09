import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PrivateRoute } from "../components/PrivateRoute";
import LoadingFallback from "../components/common/LoadingFallback";


// ========================================
// LAZY LOADING - Melhora performance inicial
// ========================================

// Páginas Públicas
const LandingPage = lazy(() => import("../pages/LandingPage"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const PublicSchedule = lazy(() => import("../pages/PublicSchedule"));
const PublicScheduleSuccess = lazy(() => import("../pages/PublicScheduleSuccess"));

// Layout
const DashboardLayout = lazy(() => import("../components/layout/Sidebar"));

// Páginas do Dashboard
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Availability = lazy(() => import("../pages/Availability"));
const Agenda = lazy(() => import("../pages/Agenda"));
const AllAppointments = lazy(() => import("../pages/AllAppointments"));
const Patients = lazy(() => import("../pages/Patients"));
const Settings = lazy(() => import("../pages/Settings"));

// ========================================
// COMPONENTE PRINCIPAL DE ROTAS
// ========================================

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ========================================
              ROTAS PÚBLICAS
              ======================================== */}
          
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Agendamento Público */}
          <Route path="/public/:slug" element={<PublicSchedule />} />
          <Route path="/public/:slug/success" element={<PublicScheduleSuccess />} />

          {/* ========================================
              ROTAS PRIVADAS (Dashboard)
              ======================================== */}
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            {/* Página Principal */}
            <Route index element={<Dashboard />} />
            
            {/* Agendamentos */}
            <Route path="appointments" element={<Agenda />} />
            <Route path="availability" element={<Availability />} />
            <Route path="allappointments" element={<AllAppointments />} />
            
            {/* Gestão */}
            <Route path="clients" element={<Patients />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* ========================================
              ROTAS DE FALLBACK
              ======================================== */}
          
          {/* Redireciona rotas desconhecidas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
