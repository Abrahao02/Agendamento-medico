import { useNavigate } from "react-router-dom"
import { FaUser, FaEnvelope, FaPhone } from "react-icons/fa"

import Input from "../components/common/Input"
import Button from "../components/common/Button"
import PasswordInput from "../components/common/PasswordInput"
import PasswordChecklist from "../components/common/PasswordChecklist"

import { useRegister } from "../hooks/auth/useRegister"
import { formatWhatsapp } from "../utils/formatter/formatWhatsapp"

import "./Register.css"

export default function Register() {
  const navigate = useNavigate()
  const { form, errors, passwordCriteria, handleChange, handleSubmit } = useRegister()

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Cadastro de Médico</h2>
        <p className="register-subtitle">Preencha seus dados para criar sua conta.</p>

        <form onSubmit={handleSubmit} className="register-form">
          <Input
            label="Nome"
            name="name"
            required
            placeholder="Nome completo"
            value={form.name}
            error={errors.name}
            leftIcon={<FaUser />}
            onChange={handleChange}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            required
            placeholder="Email"
            value={form.email}
            error={errors.email}
            leftIcon={<FaEnvelope />}
            onChange={handleChange}
          />

          <PasswordInput
            label="Senha"
            name="password"
            required
            value={form.password}
            error={errors.password}
            onChange={handleChange}
          />

          <PasswordChecklist criteria={passwordCriteria} />

          <PasswordInput
            label="Confirmar senha"
            name="confirmPassword"
            required
            value={form.confirmPassword}
            error={errors.confirmPassword}
            onChange={handleChange}
          />

          <Input
            label="WhatsApp"
            name="whatsapp"
            required
            placeholder="DDD + número"
            value={formatWhatsapp(form.whatsapp)}
            error={errors.whatsapp}
            leftIcon={<FaPhone />}
            onChange={handleChange}
          />

          <Button type="submit" className="submit-btn">Criar conta</Button>

          <Button
            type="button"
            className="submit-btn secondary"
            onClick={() => navigate("/login")}
          >
            Já tem uma conta? Voltar para Login
          </Button>
        </form>
      </div>
    </div>
  )
}
