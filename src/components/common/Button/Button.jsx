import React from 'react';
import './Button.css';

/**
 * Componente Button Reutilizável
 * 
 * @param {Object} props
 * @param {React.ElementType} props.as - Elemento/componente a ser renderizado (default: 'button')
 * @param {React.ReactNode} props.children - Conteúdo do botão
 * @param {'primary'|'secondary'|'outline'|'success'|'danger'|'warning'|'ghost'} props.variant - Estilo do botão
 * @param {'sm'|'md'|'lg'} props.size - Tamanho do botão
 * @param {boolean} props.fullWidth - Se o botão deve ocupar 100% da largura
 * @param {boolean} props.disabled - Se o botão está desabilitado
 * @param {boolean} props.loading - Se o botão está em estado de loading
 * @param {React.ReactNode} props.leftIcon - Ícone à esquerda
 * @param {React.ReactNode} props.rightIcon - Ícone à direita
 * @param {Function} props.onClick - Função ao clicar
 * @param {string} props.type - Tipo do botão (button, submit, reset)
 * @param {string} props.className - Classes CSS adicionais
 */
export default function Button({
  as: Component = 'button',
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const isNativeButton = Component === 'button';
  const isDisabled = disabled || loading;

  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    loading && 'btn-loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <Component
      type={isNativeButton ? type : undefined}
      className={buttonClasses}
      disabled={isNativeButton ? isDisabled : undefined}
      aria-disabled={!isNativeButton && isDisabled ? 'true' : undefined}
      tabIndex={!isNativeButton && isDisabled ? -1 : undefined}
      onClick={(e) => {
        if (!isNativeButton && isDisabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onClick?.(e);
      }}
      {...props}
    >
      {loading && (
        <span className="btn-spinner" aria-hidden="true">
          <svg className="spinner" viewBox="0 0 50 50">
            <circle
              className="spinner-path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
            />
          </svg>
        </span>
      )}
      
      {!loading && leftIcon && (
        <span className="btn-icon btn-icon-left">
          {leftIcon}
        </span>
      )}
      
      <span className="btn-content">
        {children}
      </span>
      
      {!loading && rightIcon && (
        <span className="btn-icon btn-icon-right">
          {rightIcon}
        </span>
      )}
    </Component>
  );
}

/**
 * Grupo de botões
 */
export function ButtonGroup({ children, className = '', ...props }) {
  return (
    <div className={`btn-group ${className}`} {...props}>
      {children}
    </div>
  );
}
