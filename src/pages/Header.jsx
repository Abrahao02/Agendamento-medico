import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import "./Header.css";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

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

        {/* Auth buttons (desktop) */}
        <div className="auth-buttons">
          <a href="/login" className="btn-login">
            Login
          </a>
          <a href="/register" className="btn-register">
            Cadastrar
          </a>
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

        <div className="mobile-auth">
          <a href="/login" className="btn-login">
            Login
          </a>
          <a href="/register" className="btn-register">
            Cadastrar
          </a>
        </div>
      </div>
    </header>
  );
}
