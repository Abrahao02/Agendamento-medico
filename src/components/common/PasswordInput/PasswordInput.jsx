import { useState } from "react"
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa"
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
      leftIcon={<FaLock />}
      rightIcon={
        <button
          type="button"
          onClick={() => setShow(prev => !prev)}
          className="password-toggle-btn"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      }
    />
  )
}
