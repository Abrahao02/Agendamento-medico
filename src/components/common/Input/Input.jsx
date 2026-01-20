import React, { forwardRef } from 'react';
import './Input.css';

/**
 * Componente Input Reutilizável
 * 
 * @param {Object} props
 * @param {string} props.label - Label do input
 * @param {string} props.error - Mensagem de erro
 * @param {string} props.helper - Texto de ajuda
 * @param {React.ReactNode} props.leftIcon - Ícone à esquerda
 * @param {React.ReactNode} props.rightIcon - Ícone à direita
 * @param {'text'|'email'|'password'|'number'|'tel'|'date'|'time'} props.type - Tipo do input
 * @param {'sm'|'md'|'lg'} props.size - Tamanho do input
 * @param {boolean} props.fullWidth - Se o input ocupa 100% da largura
 * @param {boolean} props.disabled - Se o input está desabilitado
 * @param {boolean} props.required - Se o input é obrigatório
 * @param {string} props.placeholder - Placeholder
 * @param {string} props.className - Classes CSS adicionais
 */
const Input = forwardRef(({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  type = 'text',
  size = 'md',
  fullWidth = false,
  disabled = false,
  required = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = [
    'input',
    `input-${size}`,
    fullWidth && 'input-full-width',
    error && 'input-error',
    disabled && 'input-disabled',
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'input-container',
    leftIcon && 'input-with-left-icon',
    rightIcon && 'input-with-right-icon',
  ].filter(Boolean).join(' ');

  return (
    <div className={`input-wrapper ${fullWidth ? 'input-wrapper-full-width' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      <div className={containerClasses}>
        {leftIcon && (
          <span className="input-icon input-icon-left">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={inputClasses}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : 
            helper ? `${inputId}-helper` : 
            undefined
          }
          {...props}
        />

        {rightIcon && (
          <span className="input-icon input-icon-right">
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <span 
          id={`${inputId}-error`} 
          className="input-message input-error-message"
          role="alert"
        >
          {error}
        </span>
      )}

      {!error && helper && (
        <span 
          id={`${inputId}-helper`} 
          className="input-message input-helper-text"
        >
          {helper}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

/**
 * TextArea Component
 */
export const TextArea = forwardRef(({
  label,
  error,
  helper,
  fullWidth = false,
  required = false,
  rows = 4,
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const textareaClasses = [
    'textarea',
    fullWidth && 'textarea-full-width',
    error && 'textarea-error',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`input-wrapper ${fullWidth ? 'input-wrapper-full-width' : ''}`}>
      {label && (
        <label htmlFor={textareaId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={textareaClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? `${textareaId}-error` : 
          helper ? `${textareaId}-helper` : 
          undefined
        }
        {...props}
      />

      {error && (
        <span 
          id={`${textareaId}-error`} 
          className="input-message input-error-message"
          role="alert"
        >
          {error}
        </span>
      )}

      {!error && helper && (
        <span 
          id={`${textareaId}-helper`} 
          className="input-message input-helper-text"
        >
          {helper}
        </span>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

/**
 * Input Group - Para agrupar múltiplos inputs
 */
export function InputGroup({ children, className = '', ...props }) {
  return (
    <div className={`input-group ${className}`} {...props}>
      {children}
    </div>
  );
}
