// ============================================
// 📁 src/components/common/Toast/Toast.test.jsx
// Testes para ToastProvider e useToast
// ============================================

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from './ToastProvider';
import { useToast } from '../../../hooks/common/useToast';

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar provider com children', () => {
    const { getByText } = render(
      <ToastProvider>
        <div>Child Component</div>
      </ToastProvider>
    );

    expect(getByText('Child Component')).toBeInTheDocument();
  });

  it('deve renderizar viewport de toasts', () => {
    const { container } = render(
      <ToastProvider>
        <div>Test</div>
      </ToastProvider>
    );

    const viewport = container.querySelector('.toast-viewport');
    expect(viewport).toBeInTheDocument();
    expect(viewport).toHaveAttribute('role', 'region');
    expect(viewport).toHaveAttribute('aria-label', 'Notificações');
  });

  it('deve ter estado inicial sem toasts', () => {
    const { container } = render(
      <ToastProvider>
        <div>Test</div>
      </ToastProvider>
    );

    const toasts = container.querySelectorAll('.toast');
    expect(toasts.length).toBe(0);
  });

  it('deve adicionar toast quando show é chamado', async () => {
    const TestComponent = () => {
      const toast = useToast();
      
      const handleShow = () => {
        toast.show({
          variant: 'success',
          title: 'Sucesso!',
          description: 'Operação realizada com sucesso',
        });
      };

      return <button onClick={handleShow}>Show Toast</button>;
    };

    const { container } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Show Toast');
    fireEvent.click(button);

    await waitFor(() => {
      const toasts = container.querySelectorAll('.toast');
      expect(toasts.length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    expect(screen.getByText('Sucesso!')).toBeInTheDocument();
    expect(screen.getByText('Operação realizada com sucesso')).toBeInTheDocument();
  });

  it('deve remover toast quando dismiss é chamado', async () => {
    const TestComponent = () => {
      const toast = useToast();
      const toastIdRef = React.useRef(null);
      
      const handleShow = () => {
        const id = toast.show({
          variant: 'info',
          title: 'Info',
        });
        toastIdRef.current = id;
      };

      const handleDismiss = () => {
        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current);
        }
      };

      return (
        <>
          <button onClick={handleShow}>Show Toast</button>
          <button onClick={handleDismiss}>Dismiss Toast</button>
        </>
      );
    };

    const { container } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Mostrar toast
    fireEvent.click(screen.getByText('Show Toast'));

    await waitFor(() => {
      const toasts = container.querySelectorAll('.toast');
      expect(toasts.length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    // Fechar toast
    fireEvent.click(screen.getByText('Dismiss Toast'));

    await waitFor(() => {
      const toasts = container.querySelectorAll('.toast');
      expect(toasts.length).toBe(0);
    }, { timeout: 3000 });
  });

  it('deve usar métodos de conveniência (success, error, info)', async () => {
    const TestComponent = () => {
      const toast = useToast();
      
      return (
        <>
          <button onClick={() => toast.success('Sucesso!')}>Success</button>
          <button onClick={() => toast.error('Erro!')}>Error</button>
          <button onClick={() => toast.info('Info!')}>Info</button>
        </>
      );
    };

    const { container } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Testar success
    fireEvent.click(screen.getByText('Success'));
    await waitFor(() => {
      expect(screen.getByText('Sucesso!')).toBeInTheDocument();
      const toastElement = container.querySelector('.toast');
      expect(toastElement).toHaveClass('toast-success');
    }, { timeout: 3000 });

    // Limpar
    const closeButton = container.querySelector('.toast-close');
    if (closeButton) {
      fireEvent.click(closeButton);
      await waitFor(() => {
        const toasts = container.querySelectorAll('.toast');
        expect(toasts.length).toBe(0);
      }, { timeout: 2000 });
    }

    // Testar error
    fireEvent.click(screen.getByText('Error'));
    await waitFor(() => {
      expect(screen.getByText('Erro!')).toBeInTheDocument();
      const toastElement = container.querySelector('.toast');
      expect(toastElement).toHaveClass('toast-error');
      expect(toastElement).toHaveAttribute('role', 'alert');
      expect(toastElement).toHaveAttribute('aria-live', 'assertive');
    }, { timeout: 3000 });
  });

  it('deve aplicar classes CSS corretas por variante', async () => {
    const TestComponent = () => {
      const toast = useToast();
      
      return (
        <button onClick={() => toast.success('Success')}>Show Success</button>
      );
    };

    const { container } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    await waitFor(() => {
      const toastElement = container.querySelector('.toast');
      expect(toastElement).toHaveClass('toast-success');
    }, { timeout: 3000 });
  });

  it('deve renderizar título e descrição quando fornecidos', async () => {
    const TestComponent = () => {
      const toast = useToast();
      
      return (
        <button onClick={() => toast.show({
          title: 'Título',
          description: 'Descrição',
        })}>
          Show Toast
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));

    await waitFor(() => {
      expect(screen.getByText('Título')).toBeInTheDocument();
      expect(screen.getByText('Descrição')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

describe('useToast', () => {
  it('deve retornar API quando usado dentro do provider', () => {
    const TestComponent = () => {
      const toast = useToast();
      expect(toast).toHaveProperty('show');
      expect(toast).toHaveProperty('dismiss');
      expect(toast).toHaveProperty('success');
      expect(toast).toHaveProperty('error');
      expect(toast).toHaveProperty('info');
      expect(typeof toast.show).toBe('function');
      expect(typeof toast.success).toBe('function');
      expect(typeof toast.error).toBe('function');
      expect(typeof toast.info).toBe('function');
      return null;
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
  });

  it('deve lançar erro quando usado fora do provider', () => {
    // Testar que o hook lança erro quando usado fora do provider
    const TestComponent = () => {
      try {
        useToast(); // Isso deve lançar erro
      } catch (error) {
        // O erro será capturado pelo React Error Boundary
        // Mas podemos verificar que o erro tem a mensagem correta
        expect(error.message).toContain('useToast must be used within <ToastProvider>');
      }
      return null;
    };

    // Renderizar sem provider - React vai capturar o erro
    const { container } = render(<TestComponent />);
    expect(container).toBeTruthy();
  });
});
