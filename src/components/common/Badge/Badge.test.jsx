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

  it('deve aplicar variante correta', () => {
    const { rerender } = render(<Badge variant="primary">Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('badge-primary');

    rerender(<Badge variant="success">Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('badge-success');

    rerender(<Badge variant="danger">Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('badge-danger');
  });

  it('deve aplicar tamanho correto', () => {
    const { rerender } = render(<Badge size="sm">Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('badge-sm');

    rerender(<Badge size="lg">Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('badge-lg');
  });

  it('deve aplicar classe pill quando especificado', () => {
    render(<Badge pill>Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('badge-pill');
  });

  it('deve aplicar classe outline quando especificado', () => {
    render(<Badge outline>Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('badge-outline');
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
    expect(screen.getByText('Badge')).toHaveClass('badge-removable');
  });

  it('deve chamar onRemove quando botão de remover é clicado', () => {
    const handleRemove = vi.fn();
    render(<Badge onRemove={handleRemove}>Badge</Badge>);
    
    fireEvent.click(screen.getByLabelText('Remover'));
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar apenas dot quando dot=true', () => {
    render(<Badge dot>Badge</Badge>);
    const badge = screen.getByText('Badge').closest('.badge');
    expect(badge).toHaveClass('badge-dot');
    expect(badge?.querySelector('.badge-dot-indicator')).toBeInTheDocument();
  });

  it('deve aplicar className customizada', () => {
    render(<Badge className="custom-badge">Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('custom-badge');
  });
});

describe('StatusBadge', () => {
  it('deve renderizar badge de status confirmado', () => {
    render(<StatusBadge status="confirmado" />);
    const badge = screen.getByText('Confirmado');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-success');
  });

  it('deve renderizar badge de status pendente', () => {
    render(<StatusBadge status="pendente" />);
    const badge = screen.getByText('Pendente');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-warning');
  });

  it('deve renderizar badge de status cancelado', () => {
    render(<StatusBadge status="cancelado" />);
    const badge = screen.getByText('Cancelado');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-danger');
  });

  it('deve renderizar badge de status concluído', () => {
    render(<StatusBadge status="concluido" />);
    const badge = screen.getByText('Concluído');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-info');
  });

  it('deve renderizar badge de status ausente', () => {
    render(<StatusBadge status="ausente" />);
    const badge = screen.getByText('Ausente');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-gray');
  });

  it('deve usar status como texto quando status desconhecido', () => {
    render(<StatusBadge status="desconhecido" />);
    const badge = screen.getByText('desconhecido');
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
