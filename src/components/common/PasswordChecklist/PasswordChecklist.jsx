import './PasswordChecklist.css';

export default function PasswordChecklist({ criteria = {} }) {
  return (
    <div className="password-checklist">
      <span className={criteria.length ? "valid" : "invalid"}>
        8+ caracteres
      </span>

      <span className={criteria.uppercase ? "valid" : "invalid"}>
        Uma letra maiúscula
      </span>

      <span className={criteria.lowercase ? "valid" : "invalid"}>
        Uma letra minúscula
      </span>

      <span className={criteria.number ? "valid" : "invalid"}>
        Um número
      </span>

      <span className={criteria.symbol ? "valid" : "invalid"}>
        Um símbolo
      </span>
    </div>
  )
}
