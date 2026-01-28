import { useNavigate } from "react-router-dom"
import { Mail, Phone, User, Briefcase } from "lucide-react"

import Input from "../components/common/Input"
import Button from "../components/common/Button"
import PasswordInput from "../components/common/PasswordInput"
import PasswordChecklist from "../components/common/PasswordChecklist"
import Checkbox from "../components/common/Checkbox"
import Select from "../components/common/Select"

import { useRegister } from "../hooks/auth/useRegister"
import { formatWhatsapp } from "../utils/formatter/formatWhatsapp"
import { LEGAL_ROUTES, HEALTH_PROFESSIONAL_TYPES } from "../constants/legal"

import "./Register.css"

export default function Register() {
  const navigate = useNavigate()
  const { form, errors, passwordCriteria, handleChange, handleSubmit } = useRegister()

  // Prepara opções para o Select
  const professionalOptions = HEALTH_PROFESSIONAL_TYPES.map(type => ({
    value: type.value,
    label: `${type.label} (${type.council})`
  }))

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Cadastro de Profissional</h2>
        <p className="register-subtitle">Preencha seus dados para criar sua conta.</p>

        <form onSubmit={handleSubmit} className="register-form">
          <Input
            label="Nome"
            name="name"
            required
            placeholder="Nome completo"
            value={form.name}
            error={errors.name}
            leftIcon={<User size={18} />}
            onChange={handleChange}
          />

          <Select
            label="Tipo de Profissional"
            name="professionalType"
            required
            placeholder="Selecione sua profissão"
            value={form.professionalType}
            error={errors.professionalType}
            options={professionalOptions}
            leftIcon={<Briefcase size={18} />}
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
            leftIcon={<Mail size={18} />}
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
            leftIcon={<Phone size={18} />}
            onChange={handleChange}
          />

          <div className="terms-section">
            <Checkbox
              name="acceptedTerms"
              checked={form.acceptedTerms}
              onChange={handleChange}
              error={errors.acceptedTerms}
              label={
                <>
                  Li e concordo com os{" "}
                  <a
                    href={LEGAL_ROUTES.terms}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Termos de Uso
                  </a>
                </>
              }
            />

            <Checkbox
              name="acceptedDoctorResponsibility"
              checked={form.acceptedDoctorResponsibility}
              onChange={handleChange}
              error={errors.acceptedDoctorResponsibility}
              label={
                <>
                  Li e concordo com o{" "}
                  <a
                    href={LEGAL_ROUTES.doctorResponsibility}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Termo de Responsabilidade Profissional
                  </a>
                </>
              }
            />
          </div>

          <Button type="submit" variant="primary" fullWidth>
            Criar conta
          </Button>

          <div className="back-to-login-wrapper">
            <span
              className="back-to-login-link"
              onClick={() => navigate("/login")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate("/login")}
            >
              Já tem uma conta? Voltar para Login
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
