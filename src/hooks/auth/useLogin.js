// ============================================
// 📁 src/hooks/useLogin.js - REFATORADO
// ============================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, resetPassword } from "../../services/firebase/auth.service";

import { validateFormField } from "../../utils/validators/formValidation";

export function useLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetError, setResetError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Limpar erros quando o usuário começar a digitar
    if (error) setError("");
    if (resetError) setResetError("");
  }

  function toggleShowPassword() {
    setShowPassword(prev => !prev);
  }

  function validateForm() {
    // Valida email
    const emailValidation = validateFormField("email", form.email, { 
      required: true, 
      email: true 
    });
    
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      return false;
    }

    // Valida senha
    const passwordValidation = validateFormField("password", form.password, { 
      required: true 
    });
    
    if (!passwordValidation.valid) {
      setError(passwordValidation.error);
      return false;
    }

    setError("");
    return true;
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await loginUser(form.email, form.password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    const user = result.user;

    if (!user.emailVerified) {
      setError("Verifique seu email antes de fazer login. Um novo email de verificação foi enviado.");
      return;
    }

    navigate("/dashboard");
  }

  async function handleForgotPassword() {
    const emailValidation = validateFormField("email", form.email, { 
      required: true, 
      email: true 
    });
    
    if (!emailValidation.valid) {
      setResetError(emailValidation.error || "Digite um email válido para redefinir a senha.");
      return;
    }

    const result = await resetPassword(form.email);

    if (!result.success) {
      setResetError(result.message);
      return;
    }

    setResetEmailSent(true);
    setResetError("");
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
  };
}