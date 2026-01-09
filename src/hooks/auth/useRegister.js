import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/firebase/auth.service";

import { validatePassword, isPasswordValid } from "../../utils/validators/passwordValidation";
import { formatWhatsapp } from "../../utils/formatters/formatWhatsapp";
import { createDoctor } from "../../services/firebase/doctors.service";

export function useRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    whatsapp: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const passwordCriteria = validatePassword(form.password);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "whatsapp" ? formatWhatsapp(value) : value,
    }));

    setTouched(prev => ({ ...prev, [name]: true }));
  }

  function validateForm() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório.";
    if (!form.email.trim()) newErrors.email = "Email é obrigatório.";
    if (touched.password && !isPasswordValid(passwordCriteria))
      newErrors.password = "Senha inválida.";
    if (touched.confirmPassword && form.password !== form.confirmPassword)
      newErrors.confirmPassword = "As senhas não coincidem.";

    const whatsappNumbers = form.whatsapp.replace(/\D/g, "");
    if (touched.whatsapp && !/^\d{10,11}$/.test(whatsappNumbers))
      newErrors.whatsapp = "WhatsApp inválido.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Registra usuário com AuthService
      const { success, user, message } = await registerUser(form.email, form.password);

      if (!success) {
        if (message.toLowerCase().includes("email")) {
          setErrors(prev => ({ ...prev, email: message }));
        } else if (message.toLowerCase().includes("senha") || message.toLowerCase().includes("weak")) {
          setErrors(prev => ({ ...prev, password: message }));
        } else {
          console.error(message);
        }
        return;
      }

      const doctorResult = await createDoctor({
        uid: user.uid,
        name: form.name,
        email: form.email,
        whatsapp: form.whatsapp.replace(/\D/g, ""),
      });

      if (!doctorResult.success) {
        throw new Error(doctorResult.error);
      }

      navigate("/login");
    } catch (error) {
      console.error("Erro no registro:", error);
    }
  }

  return {
    form,
    errors,
    passwordCriteria,
    handleChange,
    handleSubmit,
  };
}
