import { useState, useEffect } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "../services/firebase"
import { generateSlug } from "../utils/generateSlug"
import { createDoctor, isSlugAvailable } from "../services/doctors"
import { useNavigate } from "react-router-dom"
import {
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUser,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa"
import "./Register.css"

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    whatsapp: "",
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  })

  useEffect(() => {
    validateForm()
    validatePassword(form.password)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  function validatePassword(password) {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[\W_]/.test(password),
    })
  }

  function validateForm() {
    const newErrors = {}

    if (!form.name.trim()) newErrors.name = "Nome é obrigatório."
    if (!form.email.trim()) newErrors.email = "Email é obrigatório."
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email inválido."

    if (!form.password) newErrors.password = "Senha é obrigatória."
    else if (
      !(
        passwordCriteria.length &&
        passwordCriteria.uppercase &&
        passwordCriteria.lowercase &&
        passwordCriteria.number &&
        passwordCriteria.symbol
      )
    )
      newErrors.password = "Senha não atende aos requisitos."

    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "As senhas não coincidem."

    if (!form.whatsapp.trim()) newErrors.whatsapp = "WhatsApp é obrigatório."
    else if (!/^\d{10,11}$/.test(form.whatsapp))
      newErrors.whatsapp = "Informe apenas números (DDD + número)."

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return

    let userCredential = null

    try {
      const { name, email, password, whatsapp } = form
      userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      const baseSlug = generateSlug(name)
      let slug = baseSlug
      let available = await isSlugAvailable(slug)
      let count = 2
      while (!available) {
        slug = `${baseSlug}-${count}`
        available = await isSlugAvailable(slug)
        count++
      }

      await createDoctor({ uid, name, email, whatsapp, slug })

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        whatsapp: "",
      })
      setErrors({})
      navigate("/login")
    } catch (error) {
      console.error(error)
      if (userCredential?.user) {
        await userCredential.user.delete()
      }
      if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "Esse e-mail já está cadastrado." })
      } else {
        alert("Erro ao criar cadastro. Tente novamente.")
      }
    }
  }

  return (
    <div className="register-container">
      <h2>Cadastro de Médico</h2>
      <form onSubmit={handleSubmit} className="register-form">

        {/* Nome */}
        <label>
          Nome
          <div className="input-wrapper">
            <FaUser className="icon" />
            <input
              value={form.name}
              placeholder="Nome completo"
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          {errors.name && <span className="error">{errors.name}</span>}
        </label>

        {/* Email */}
        <label>
          Email
          <div className="input-wrapper">
            <FaEnvelope className="icon" />
            <input
              type="email"
              value={form.email}
              placeholder="Email"
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          {errors.email && <span className="error">{errors.email}</span>}
        </label>

        {/* Senha */}
        <label>
          Senha
          <div className="input-wrapper">
            <FaLock className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              placeholder="Senha"
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="password-checklist">
            <span className={passwordCriteria.length ? "valid" : ""}>
              8+ caracteres
            </span>
            <span className={passwordCriteria.uppercase ? "valid" : ""}>
              Uma maiúscula
            </span>
            <span className={passwordCriteria.lowercase ? "valid" : ""}>
              Uma minúscula
            </span>
            <span className={passwordCriteria.number ? "valid" : ""}>Um número</span>
            <span className={passwordCriteria.symbol ? "valid" : ""}>
              Um símbolo
            </span>
          </div>
          {errors.password && <span className="error">{errors.password}</span>}
        </label>

        {/* Confirmar senha */}
        <label>
          Confirme a senha
          <div className="input-wrapper">
            <FaLock className="icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              placeholder="Confirme a senha"
              onChange={e =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword}</span>
          )}
        </label>

        {/* WhatsApp */}
        <label>
          WhatsApp
          <div className="input-wrapper">
            <FaPhone className="icon" />
            <input
              value={form.whatsapp}
              placeholder="DDD + número, apenas números"
              onChange={e => setForm({ ...form, whatsapp: e.target.value })}
            />
          </div>
          {errors.whatsapp && <span className="error">{errors.whatsapp}</span>}
        </label>

        <button type="submit" className="submit-btn">
          Criar conta
        </button>

        <button
          type="button"
          className="submit-btn secondary"
          onClick={() => navigate("/login")}
        >
          Já tem uma conta? Voltar para Login
        </button>
      </form>
    </div>
  )
}
