import { useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import Input from "../Input"
import "./PasswordInput.css"

export default function PasswordInput({
  label,
  name,
  value,
  error,
  onChange,
}) {
  const [show, setShow] = useState(false)

  return (
    <Input
      label={label}
      name={name}
      type={show ? "text" : "password"}
      value={value}
      error={error}
      onChange={onChange}
      leftIcon={<Lock size={18} />}
      rightIcon={
        <button
          type="button"
          onClick={() => setShow(prev => !prev)}
          className="password-toggle-btn"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  )
}
