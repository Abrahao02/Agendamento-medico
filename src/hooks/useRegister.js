import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser } from "../services/auth"
import { createDoctor, isSlugAvailable } from "../services/doctors"
import { generateSlug } from "../utils/generateSlug"
import {
  validatePassword,
  isPasswordValid,
} from "../utils/passwordValidation"
import { formatWhatsapp } from "../utils/formatWhatsapp"

export function useRegister() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    whatsapp: "",
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const passwordCriteria = validatePassword(form.password)

  function handleChange(e) {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: name === "whatsapp"
        ? formatWhatsapp(value)
        : value,
    }))

    setTouched(prev => ({
      ...prev,
      [name]: true,
    }))
  }

  function validateForm() {
    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name = "Nome é obrigatório."
    }

    if (!form.email.trim()) {
      newErrors.email = "Email é obrigatório."
    }

    if (touched.password && !isPasswordValid(passwordCriteria)) {
      newErrors.password = "Senha inválida."
    }

    if (
      touched.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      newErrors.confirmPassword = "As senhas não coincidem."
    }

    // 🔹 Remove máscara antes de validar
    const whatsappNumbers = form.whatsapp.replace(/\D/g, "")

    if (
      touched.whatsapp &&
      !/^\d{10,11}$/.test(whatsappNumbers)
    ) {
      newErrors.whatsapp = "WhatsApp inválido."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const user = await registerUser(form.email, form.password)

      let slug = generateSlug(form.name)
      let count = 2

      while (!(await isSlugAvailable(slug))) {
        slug = `${slug}-${count++}`
      }

      await createDoctor({
        uid: user.uid,
        name: form.name,
        email: form.email,
        whatsapp: form.whatsapp.replace(/\D/g, ""),
        slug,
      })

      navigate("/login")

    } catch (error) {
      console.error(error)

      if (error.code === "auth/email-already-in-use") {
        setErrors(prev => ({
          ...prev,
          email: "Este email já está em uso.",
        }))
      }

      if (error.code === "auth/invalid-email") {
        setErrors(prev => ({
          ...prev,
          email: "Email inválido.",
        }))
      }

      if (error.code === "auth/weak-password") {
        setErrors(prev => ({
          ...prev,
          password: "A senha deve ter pelo menos 6 caracteres.",
        }))
      }
    }
  }

  return {
    form,
    errors,
    passwordCriteria,
    handleChange,
    handleSubmit,
  }
}
