import React from 'react';
import './Badge.css';

/**
 * Componente Badge Reutilizável
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Conteúdo do badge
 * @param {'primary'|'secondary'|'success'|'warning'|'danger'|'info'|'gray'} props.variant - Estilo do badge
 * @param {'sm'|'md'|'lg'} props.size - Tamanho do badge
 * @param {boolean} props.pill - Badge com bordas arredondadas
 * @param {boolean} props.outline - Badge com contorno
 * @param {React.ReactNode} props.icon - Ícone ao lado do texto
 * @param {boolean} props.dot - Mostra apenas um ponto (sem texto)
 * @param {Function} props.onRemove - Função para remover o badge (mostra X)
 * @param {string} props.className - Classes CSS adicionais
 */
export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  outline = false,
  icon,
  dot = false,
  onRemove,
  className = '',
  ...props
}) {
  const badgeClasses = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    pill && 'badge-pill',
    outline && 'badge-outline',
    dot && 'badge-dot',
    onRemove && 'badge-removable',
    className
  ].filter(Boolean).join(' ');

  if (dot) {
    return (
      <span className={badgeClasses} {...props}>
        <span className="badge-dot-indicator" />
      </span>
    );
  }

  return (
    <span className={badgeClasses} {...props}>
      {icon && <span className="badge-icon">{icon}</span>}
      {children && <span className="badge-text">{children}</span>}
      {onRemove && (
        <button
          type="button"
          className="badge-remove"
          onClick={onRemove}
          aria-label="Remover"
        >
          ×
        </button>
      )}
    </span>
  );
}

/**
 * Badge de Status - Para mostrar status de consultas, etc
 */
export function StatusBadge({ status, ...props }) {
  const statusConfig = {
    confirmado: { variant: 'success', text: 'Confirmado' },
    pendente: { variant: 'warning', text: 'Pendente' },
    cancelado: { variant: 'danger', text: 'Cancelado' },
    concluido: { variant: 'info', text: 'Concluído' },
    ausente: { variant: 'gray', text: 'Ausente' }
  };

  const config = statusConfig[status?.toLowerCase()] || {
    variant: 'gray',
    text: status
  };

  return (
    <Badge variant={config.variant} {...props}>
      {config.text}
    </Badge>
  );
}

/**
 * Badge Group - Para agrupar múltiplos badges
 */
export function BadgeGroup({ children, className = '', ...props }) {
  return (
    <div className={`badge-group ${className}`} {...props}>
      {children}
    </div>
  );
}
