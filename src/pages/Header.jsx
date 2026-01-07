import React, { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { auth, db } from "../services/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [user, setUser] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();

  // Detecta scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detecta login e busca nome no Firestore
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) return setUser(null);
      setUser(u);

      const snap = await getDoc(doc(db, "doctors", u.uid));
      if (snap.exists()) {
        setDoctorName(snap.data().name || u.email);
      } else {
        setDoctorName(u.email); // fallback
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        {/* Logo */}
        <a href="/" className="logo">
          <span className="logo-icon">📅</span>
          <span className="logo-text">MedAgenda</span>
        </a>

        {/* Desktop nav */}
        <nav className={`nav-links ${isMobileMenuOpen ? "open" : ""}`}>
          <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>
            Funcionalidades
          </a>
          <a href="#plans" onClick={() => setIsMobileMenuOpen(false)}>
            Planos
          </a>
        </nav>

        {/* Auth buttons / User info */}
        <div className="auth-buttons">
          {!user ? (
            <>
              <a href="/login" className="btn-login">
                Login
              </a>
              <a href="/register" className="btn-register">
                Cadastrar
              </a>
            </>
          ) : (
            <div className="user-info">
              <button
                className="user-name"
                onClick={toggleDropdown}
                title="Clique para opções"
              >
                {`Olá, ${doctorName}`}
              </button>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Ir para Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sair <LogOut size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>
          Funcionalidades
        </a>
        <a href="#plans" onClick={() => setIsMobileMenuOpen(false)}>
          Planos
        </a>

        {!user ? (
          <div className="mobile-auth">
            <a href="/login" className="btn-login">
              Login
            </a>
            <a href="/register" className="btn-register">
              Cadastrar
            </a>
          </div>
        ) : (
          <div className="mobile-auth user-info">
            <button
              className="user-name"
              onClick={toggleDropdown}
              title="Clique para opções"
            >
              {doctorName}
            </button>

            {dropdownOpen && (
              <div className="user-dropdown">
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setDropdownOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Ir para Dashboard
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
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
