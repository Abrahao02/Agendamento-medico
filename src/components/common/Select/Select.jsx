import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import './Select.css';

/**
 * Componente Select Reutilizável
 *
 * @param {Object} props
 * @param {string} props.label - Label do select
 * @param {string} props.error - Mensagem de erro
 * @param {string} props.helper - Texto de ajuda
 * @param {React.ReactNode} props.leftIcon - Ícone à esquerda
 * @param {Array<{value: string, label: string}>} props.options - Opções do select
 * @param {string} props.placeholder - Placeholder
 * @param {'sm'|'md'|'lg'} props.size - Tamanho do select
 * @param {boolean} props.fullWidth - Se o select ocupa 100% da largura
 * @param {boolean} props.disabled - Se o select está desabilitado
 * @param {boolean} props.required - Se o select é obrigatório
 * @param {string} props.className - Classes CSS adicionais
 */
const Select = forwardRef(({
  label,
  error,
  helper,
  leftIcon,
  options = [],
  placeholder = 'Selecione...',
  size = 'md',
  fullWidth = true,
  disabled = false,
  required = false,
  className = '',
  id,
  value,
  ...props
}, ref) => {
  const generatedId = useId();
  const selectId = id || `select-${generatedId}`;

  const selectClasses = [
    'select',
    `select-${size}`,
    fullWidth && 'select-full-width',
    error && 'select-error',
    disabled && 'select-disabled',
    leftIcon && 'select-with-left-icon',
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'select-container',
    leftIcon && 'select-container-with-left-icon',
  ].filter(Boolean).join(' ');

  return (
    <div className={`select-wrapper ${fullWidth ? 'select-wrapper-full-width' : ''}`}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}

      <div className={containerClasses}>
        {leftIcon && (
          <span className="select-icon select-icon-left">
            {leftIcon}
          </span>
        )}

        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          disabled={disabled}
          required={required}
          value={value}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${selectId}-error` :
            helper ? `${selectId}-helper` :
            undefined
          }
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className="select-icon select-icon-right">
          <ChevronDown size={18} />
        </span>
      </div>

      {error && (
        <span
          id={`${selectId}-error`}
          className="select-message select-error-message"
          role="alert"
        >
          {error}
        </span>
      )}

      {!error && helper && (
        <span
          id={`${selectId}-helper`}
          className="select-message select-helper-text"
        >
          {helper}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
