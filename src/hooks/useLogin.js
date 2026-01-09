import { useState, useEffect } from "react"
import { signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../services/firebase"
import { useNavigate } from "react-router-dom"

export function useLogin() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [resetError, setResetError] = useState("")

  useEffect(() => {
    setError("")
    setResetError("")
  }, [form.email, form.password])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function toggleShowPassword() {
    setShowPassword(prev => !prev)
  }

  function validateForm() {
    if (!form.email.trim()) {
      setError("Email é obrigatório.")
      return false
    }
    if (!form.password) {
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
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password)
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
    if (!form.email.trim()) {
      setResetError("Digite seu email para redefinir a senha.")
      return
    }
    try {
      await sendPasswordResetEmail(auth, form.email)
      setResetEmailSent(true)
      setResetError("")
    } catch (err) {
      console.error(err)
      setResetError("Erro ao enviar email de redefinição. Verifique o email.")
    }
  }

  return {
    form,
    error,
    resetError,
    resetEmailSent,
    showPassword,
    handleChange,
    toggleShowPassword,
    handleLogin,
    handleForgotPassword,
  }
}
