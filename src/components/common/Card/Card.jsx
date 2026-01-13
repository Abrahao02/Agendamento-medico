import React from 'react';
import './Card.css';

/**
 * Componente Card Reutilizável
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Conteúdo do card
 * @param {string} props.title - Título do card
 * @param {React.ReactNode} props.header - Conteúdo do header customizado
 * @param {React.ReactNode} props.footer - Conteúdo do footer
 * @param {boolean} props.hoverable - Se o card tem efeito hover
 * @param {boolean} props.clickable - Se o card é clicável
 * @param {Function} props.onClick - Função ao clicar no card
 * @param {string} props.className - Classes CSS adicionais
 * @param {'sm'|'md'|'lg'} props.padding - Tamanho do padding
 * @param {boolean} props.noPadding - Remove padding do conteúdo
 */
export default function Card({
  children,
  title,
  header,
  footer,
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  padding = 'md',
  noPadding = false,
  ...props
}) {
  const cardClasses = [
    'card',
    `card-padding-${padding}`,
    hoverable && 'card-hoverable',
    clickable && 'card-clickable',
    noPadding && 'card-no-padding',
    className
  ].filter(Boolean).join(' ');

  const CardWrapper = clickable ? 'button' : 'div';

  return (
    <CardWrapper
      className={cardClasses}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {(header || title) && (
        <div className="card-header">
          {header || <h3 className="card-title">{title}</h3>}
        </div>
      )}

      <div className="card-content">
        {children}
      </div>

      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </CardWrapper>
  );
}

/**
 * Card Section - Para dividir o card em seções
 */
export function CardSection({ children, className = '', ...props }) {
  return (
    <div className={`card-section ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * Card Grid - Para layout de múltiplos cards
 */
export function CardGrid({ 
  children, 
  columns = 3, 
  gap = 'md',
  className = '',
  ...props 
}) {
  return (
    <div 
      className={`card-grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${300 / columns}px), 1fr))`,
        gap: `var(--spacing-${gap})`
      }}
      {...props}
    >
      {children}
    </div>
  );
}
