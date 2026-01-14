// src/components/layout/Header/Header.jsx
import React, { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { auth, db } from "../../../services/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

import useSmoothScroll from "../../../hooks/common/useSmoothScroll";

export default function Header() {
  const navigate = useNavigate();

  const { scrollTo } = useSmoothScroll({
    offset: 80,
  });

  const [user, setUser] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  // Detecta scroll (efeito visual do header)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detecta auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        setUser(null);
        return;
      }

      setUser(u);

      const snap = await getDoc(doc(db, "doctors", u.uid));
      setDoctorName(snap.exists() ? snap.data().name : u.email);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const handleScroll = (id) => {
    scrollTo(id);
    setIsMobileMenuOpen(false);
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        {/* Logo */}
        <button
          className="logo"
          onClick={() => handleScroll("hero")}
        >
          MedAgenda
        </button>

        {/* Desktop Nav */}
        <nav className={`nav-links ${isMobileMenuOpen ? "open" : ""}`}>
          <button onClick={() => handleScroll("features")}>
            Funcionalidades
          </button>

          <button onClick={() => handleScroll("plans")}>
            Planos
          </button>
        </nav>

        {/* Auth / User */}
        <div className="auth-buttons">
          {!user ? (
            <>
              <Link to="/login" className="btn-login">
                Login
              </Link>
              <Link to="/register" className="btn-register">
                Cadastrar
              </Link>
            </>
          ) : (
            <div className="user-info">
              <button
                className="user-name"
                onClick={() => setDropdownOpen((p) => !p)}
              >
                Olá, {doctorName}
              </button>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <button onClick={() => navigate("/dashboard")}>
                    Ir para Dashboard
                  </button>
                  <button onClick={handleLogout}>
                    Sair <LogOut size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen((p) => !p)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <button onClick={() => handleScroll("features")}>
          Funcionalidades
        </button>

        <button onClick={() => handleScroll("plans")}>
          Planos
        </button>

        {!user ? (
          <div className="mobile-auth">
            <Link to="/login">Login</Link>
            <Link to="/register">Cadastrar</Link>
          </div>
        ) : (
          <div className={`mobile-user-section ${mobileDropdownOpen ? "open" : ""}`}>
            <button 
              className="mobile-user-name"
              onClick={() => setMobileDropdownOpen((p) => !p)}
            >
              Olá, {doctorName}
            </button>
            {mobileDropdownOpen && (
              <div className="mobile-user-dropdown">
                <button onClick={() => {
                  navigate("/dashboard");
                  setIsMobileMenuOpen(false);
                  setMobileDropdownOpen(false);
                }}>
                  Dashboard
                </button>
                <button onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                  setMobileDropdownOpen(false);
                }}>
                  Sair <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
