import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import DashboardLayout from "../pages/DashboardLayout"; // Novo layout com Navbar
import Dashboard from "../pages/Dashboard";
import Availability from "../pages/Availability";
import Agenda from "../pages/Agenda";
import PublicSchedule from "../pages/PublicSchedule";
import { PrivateRoute } from "../components/PrivateRoute";
import PublicScheduleSuccess from "../pages/PublicScheduleSuccess";
import AllAppointments from "../pages/AllAppointments";
import Patients from "../pages/patients";
import LandingPage from "../pages/LandingPage";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/public/:slug" element={<PublicSchedule />} />
        <Route path="/public/:slug/success" element={<PublicScheduleSuccess />} />
        

        {/* Rotas privadas com DashboardLayout (Navbar) */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          {/* Rotas filhas */}
          <Route index element={<Dashboard />} />
          <Route path="availability" element={<Availability />} />
          <Route path="appointments" element={<Agenda />} />
          <Route path="allappointments" element={<AllAppointments />} />
          <Route path="patients" element={<Patients />} />
        </Route>

        {/* Rota padrão */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
