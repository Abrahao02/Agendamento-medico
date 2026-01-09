import React, { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { auth, db } from "../../../services/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Header.css";

import useSmoothScroll from "../../../hooks/common/useSmoothScroll";

export default function Header() {

  const { scrollTo } = useSmoothScroll();

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
        <Link to="/" className="logo">
          <span className="logo-text">MedAgenda</span>
        </Link>

        {/* Desktop nav */}
        <nav className={`nav-links ${isMobileMenuOpen ? "open" : ""}`}>
          <button
            type="button"
            onClick={() => {
              scrollTo("features");
              setIsMobileMenuOpen(false);
            }}
          >
            Funcionalidades
          </button>

          <button
            type="button"
            onClick={() => {
              scrollTo("plans");
              setIsMobileMenuOpen(false);
            }}
          >
            Planos
          </button>

        </nav>

        {/* Auth buttons / User info */}
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
        <button
          type="button"
          onClick={() => {
            scrollTo("features");
            setIsMobileMenuOpen(false);
          }}
        >
          Funcionalidades
        </button>

        <button
          type="button"
          onClick={() => {
            scrollTo("plans");
            setIsMobileMenuOpen(false);
          }}
        >
          Planos
        </button>

        {!user ? (
          <div className="mobile-auth">
            <Link to="/login" className="btn-login">
              Login
            </Link>

            <Link to="/register" className="btn-register">
              Cadastrar
            </Link>
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
