/* ============================================
   ✅ CHECKBOX - COMPONENTE REUTILIZÁVEL
   ============================================
   
   Props:
   - checked: boolean (estado do checkbox)
   - onChange: function (callback para mudança)
   - label: string | JSX (texto/elemento ao lado)
   - disabled: boolean (desabilita interação)
   - error: string (mensagem de erro)
   - name: string (nome do input)
   - id: string (id do input, auto-gerado se omitido)
*/

import "./Checkbox.css";

export default function Checkbox({
    checked = false,
    onChange,
    label,
    disabled = false,
    error,
    name,
    id,
}) {
    const checkboxId = id || `checkbox-${name || Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="checkbox-wrapper">
            <div className="checkbox-container">
                <input
                    type="checkbox"
                    id={checkboxId}
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="checkbox-input"
                    aria-invalid={!!error}
                    aria-describedby={error ? `${checkboxId}-error` : undefined}
                />
                <label htmlFor={checkboxId} className="checkbox-label">
                    <span className="checkbox-box">
                        {checked && (
                            <svg
                                className="checkbox-icon"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path
                                    d="M13.5 4L6 11.5L2.5 8"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        )}
                    </span>
                    {label && <span className="checkbox-text">{label}</span>}
                </label>
            </div>
            {error && (
                <p id={`${checkboxId}-error`} className="checkbox-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
