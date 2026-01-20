// ============================================
// 📁 src/components/common/Badge/Badge.test.jsx
// Testes para componente Badge
// ============================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Badge, { StatusBadge, BadgeGroup } from './Badge';

describe('Badge', () => {
  it('deve renderizar conteúdo do badge', () => {
    render(<Badge>Novo</Badge>);
    expect(screen.getByText('Novo')).toBeInTheDocument();
  });

  it.each([
    ['primary', 'badge-primary'],
    ['success', 'badge-success'],
    ['danger', 'badge-danger']
  ])('deve aplicar variante %s corretamente', (variant, expectedClass) => {
    render(<Badge variant={variant}>Badge</Badge>);
    expect(screen.getByText('Badge').closest('.badge')).toHaveClass(expectedClass);
  });

  it.each([
    ['sm', 'badge-sm'],
    ['lg', 'badge-lg']
  ])('deve aplicar tamanho %s corretamente', (size, expectedClass) => {
    render(<Badge size={size}>Badge</Badge>);
    expect(screen.getByText('Badge').closest('.badge')).toHaveClass(expectedClass);
  });

  it('deve aplicar classe pill quando especificado', () => {
    render(<Badge pill>Badge</Badge>);
    expect(screen.getByText('Badge').closest('.badge')).toHaveClass('badge-pill');
  });

  it('deve aplicar classe outline quando especificado', () => {
    render(<Badge outline>Badge</Badge>);
    expect(screen.getByText('Badge').closest('.badge')).toHaveClass('badge-outline');
  });

  it('deve renderizar ícone quando fornecido', () => {
    const icon = <span data-testid="badge-icon">★</span>;
    render(<Badge icon={icon}>Badge</Badge>);
    expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
  });

  it('deve renderizar botão de remover quando onRemove fornecido', () => {
    const handleRemove = vi.fn();
    render(<Badge onRemove={handleRemove}>Badge</Badge>);
    
    const removeButton = screen.getByLabelText('Remover');
    expect(removeButton).toBeInTheDocument();
    expect(screen.getByText('Badge').closest('.badge')).toHaveClass('badge-removable');
  });

  it('deve chamar onRemove quando botão de remover é clicado', () => {
    const handleRemove = vi.fn();
    render(<Badge onRemove={handleRemove}>Badge</Badge>);
    
    fireEvent.click(screen.getByLabelText('Remover'));
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar apenas dot quando dot=true', () => {
    const { container } = render(<Badge dot>Badge</Badge>);
    const badge = container.querySelector('.badge');
    expect(badge).toHaveClass('badge-dot');
    expect(badge?.querySelector('.badge-dot-indicator')).toBeInTheDocument();
    // Quando dot=true, o texto não é renderizado
    expect(screen.queryByText('Badge')).not.toBeInTheDocument();
  });

  it('deve aplicar className customizada', () => {
    render(<Badge className="custom-badge">Badge</Badge>);
    expect(screen.getByText('Badge').closest('.badge')).toHaveClass('custom-badge');
  });
});

describe('StatusBadge', () => {
  it.each([
    ['confirmado', 'Confirmado', 'badge-success'],
    ['pendente', 'Pendente', 'badge-warning'],
    ['cancelado', 'Cancelado', 'badge-danger'],
    ['concluido', 'Concluído', 'badge-info'],
    ['ausente', 'Ausente', 'badge-gray']
  ])('deve renderizar badge de status %s corretamente', (status, expectedText, expectedClass) => {
    render(<StatusBadge status={status} />);
    const badge = screen.getByText(expectedText).closest('.badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(expectedClass);
  });

  it('deve usar status como texto quando status desconhecido', () => {
    render(<StatusBadge status="desconhecido" />);
    const badge = screen.getByText('desconhecido').closest('.badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-gray');
  });

  it('deve ser case-insensitive', () => {
    render(<StatusBadge status="CONFIRMADO" />);
    expect(screen.getByText('Confirmado')).toBeInTheDocument();
  });
});

describe('BadgeGroup', () => {
  it('deve renderizar grupo de badges', () => {
    render(
      <BadgeGroup>
        <Badge>Badge 1</Badge>
        <Badge>Badge 2</Badge>
      </BadgeGroup>
    );
    
    expect(screen.getByText('Badge 1')).toBeInTheDocument();
    expect(screen.getByText('Badge 2')).toBeInTheDocument();
  });

  it('deve aplicar className customizada', () => {
    const { container } = render(
      <BadgeGroup className="custom-group">
        <Badge>Badge</Badge>
      </BadgeGroup>
    );
    
    expect(container.firstChild).toHaveClass('custom-group');
  });
});
