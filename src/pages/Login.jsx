// ============================================
// 📁 src/pages/Login.jsx - REFATORADO
// ============================================
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useLogin } from "../hooks/auth/useLogin";
import "./Login.css";

export default function Login() {
  const {
    form,
    error,
    resetError,
    resetEmailSent,
    showPassword,
    handleChange,
    toggleShowPassword,
    handleLogin,
    handleForgotPassword
  } = useLogin();

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>

        <form onSubmit={handleLogin} className="login-form">
          <label>
            Email
            <div className="input-wrapper">
              <FaEnvelope className="icon" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </label>

          <label>
            Senha
            <div className="input-wrapper">
              <FaLock className="icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Senha"
                value={form.password}
                onChange={handleChange}
              />
              <button 
                type="button" 
                className="toggle-btn" 
                onClick={toggleShowPassword}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </label>

          {error && <span className="error">{error}</span>}

          <button type="submit" className="submit-btn">
            Entrar
          </button>
          
          <button 
            type="button" 
            className="submit-btn secondary" 
            onClick={() => window.location.href = "/register"}
          >
            Registrar-se
          </button>

          <div className="forgot-link-wrapper">
            <span 
              className="forgot-link" 
              onClick={handleForgotPassword}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleForgotPassword()}
            >
              Esqueci minha senha
            </span>
          </div>

          {resetError && <span className="error">{resetError}</span>}
          {resetEmailSent && (
            <span className="success">
              Email de redefinição enviado! Verifique sua caixa de entrada.
            </span>
          )}
        </form>
      </div>
    </div>
  );
}