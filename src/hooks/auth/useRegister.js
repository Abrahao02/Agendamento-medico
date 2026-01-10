// ============================================
// 📁 src/hooks/useRegister.js - REFATORADO
// ============================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/firebase/auth.service";
import { createDoctor } from "../../services/firebase/doctors.service";

// ✅ Imports de utils
import { validatePassword, isPasswordValid } from "../../utils/validators/passwordValidation";
import { validateFormField } from "../../utils/validators/formValidation";
import { formatWhatsapp } from "../../utils/formatter/formatWhatsapp";
import { cleanWhatsapp } from "../../utils/whatsapp/cleanWhatsapp";

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
    
    // ✅ Usa util para formatar WhatsApp
    setForm(prev => ({
      ...prev,
      [name]: name === "whatsapp" ? formatWhatsapp(value) : value,
    }));

    setTouched(prev => ({ ...prev, [name]: true }));
  }

  // ✅ Validação usando util validateFormField
  function validateForm() {
    const newErrors = {};

    // Valida nome
    const nameValidation = validateFormField("name", form.name, { required: true });
    if (!nameValidation.valid) {
      newErrors.name = nameValidation.error;
    }

    // Valida email
    const emailValidation = validateFormField("email", form.email, { 
      required: true, 
      email: true 
    });
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error;
    }

    // Valida senha (apenas se tocada)
    if (touched.password && !isPasswordValid(passwordCriteria)) {
      newErrors.password = "Senha não atende aos critérios de segurança.";
    }

    // Valida confirmação de senha
    if (touched.confirmPassword) {
      const confirmValidation = validateFormField("confirmPassword", form.confirmPassword, {
        required: true,
        match: {
          value: form.password,
          message: "As senhas não coincidem."
        }
      });
      if (!confirmValidation.valid) {
        newErrors.confirmPassword = confirmValidation.error;
      }
    }

    // ✅ Valida WhatsApp usando util
    if (touched.whatsapp) {
      const whatsappValidation = validateFormField("whatsapp", cleanWhatsapp(form.whatsapp), {
        required: true,
        whatsapp: true
      });
      if (!whatsappValidation.valid) {
        newErrors.whatsapp = whatsappValidation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Marca todos os campos como tocados antes de validar
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      whatsapp: true
    });

    if (!validateForm()) return;

    try {
      // Registra usuário com AuthService
      const { success, user, message } = await registerUser(form.email, form.password);

      if (!success) {
        // Tratamento de erros específicos
        if (message.toLowerCase().includes("email")) {
          setErrors(prev => ({ ...prev, email: message }));
        } else if (message.toLowerCase().includes("senha") || message.toLowerCase().includes("weak")) {
          setErrors(prev => ({ ...prev, password: message }));
        } else {
          setErrors(prev => ({ ...prev, general: message }));
        }
        return;
      }

      // ✅ Cria médico com WhatsApp limpo
      const doctorResult = await createDoctor({
        uid: user.uid,
        name: form.name.trim(),
        email: form.email.trim(),
        whatsapp: cleanWhatsapp(form.whatsapp), // Remove formatação
      });

      if (!doctorResult.success) {
        throw new Error(doctorResult.error);
      }

      navigate("/login");
    } catch (error) {
      console.error("Erro no registro:", error);
      setErrors(prev => ({ 
        ...prev, 
        general: "Erro ao criar conta. Tente novamente." 
      }));
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