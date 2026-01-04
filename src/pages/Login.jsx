import { useState, useEffect } from "react"
import { signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../services/firebase"
import { useNavigate } from "react-router-dom"
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa"
import "./Login.css"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  useEffect(() => {
    // Limpa erro ao digitar
    setError("")
  }, [email, password])

  function validateForm() {
    if (!email.trim()) {
      setError("Email é obrigatório.")
      return false
    }
    if (!password) {
      setError("Senha é obrigatória.")
      return false
    }
    setError("")
    return true
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (!user.emailVerified) {
        setError("Verifique seu email antes de fazer login. Um novo email de verificação foi enviado.")
        await sendEmailVerification(user)
        return
      }

      navigate("/dashboard")
    } catch (err) {
      console.error(err)
      setError("Login inválido. Verifique email e senha.")
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError("Digite seu email para redefinir a senha.")
      return
    }
    try {
      await sendPasswordResetEmail(auth, email)
      setResetEmailSent(true)
      setError("")
    } catch (err) {
      console.error(err)
      setError("Erro ao enviar email de redefinição. Verifique o email.")
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login</h2>

        {/* Email */}
        <label>
          Email
          <div className="input-wrapper">
            <FaEnvelope className="icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </label>

        {/* Senha */}
        <label>
          Senha
          <div className="input-wrapper">
            <FaLock className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
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
          onClick={() => navigate("/register")}
        >
          Registrar-se
        </button>

        <button
          type="button"
          className="forgot-btn"
          onClick={handleForgotPassword}
        >
          Esqueci minha senha
        </button>

        {resetEmailSent && <span className="success">Email de redefinição enviado! Verifique sua caixa de entrada.</span>}
      </form>
    </div>
  )
}
