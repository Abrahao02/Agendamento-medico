// ============================================
// 📁 src/hooks/auth/useLogin.test.js
// Testes para hook useLogin
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLogin } from './useLogin';
import { loginUser, resetPassword } from '../../services/firebase/auth.service';
import { validateFormField } from '../../utils/validators/formValidation';

// Mock do React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock dos serviços
vi.mock('../../services/firebase/auth.service', () => ({
  loginUser: vi.fn(),
  resetPassword: vi.fn()
}));

// Mock do validator
vi.mock('../../utils/validators/formValidation', () => ({
  validateFormField: vi.fn()
}));

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('handleChange', () => {
    it('deve atualizar email no form', () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@test.com' }
        });
      });

      expect(result.current.form.email).toBe('test@test.com');
    });

    it('deve atualizar password no form', () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'password', value: 'password123' }
        });
      });

      expect(result.current.form.password).toBe('password123');
    });
  });

  describe('toggleShowPassword', () => {
    it('deve alternar showPassword', () => {
      const { result } = renderHook(() => useLogin());

      expect(result.current.showPassword).toBe(false);

      act(() => {
        result.current.toggleShowPassword();
      });

      expect(result.current.showPassword).toBe(true);

      act(() => {
        result.current.toggleShowPassword();
      });

      expect(result.current.showPassword).toBe(false);
    });
  });

  describe('handleLogin', () => {
    it('deve fazer login com sucesso e navegar para dashboard', async () => {
      const mockUser = { uid: '123', email: 'test@test.com', emailVerified: true };
      loginUser.mockResolvedValue({ success: true, user: mockUser });
      validateFormField.mockReturnValue({ valid: true });

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@test.com' }
        });
        result.current.handleChange({
          target: { name: 'password', value: 'password123' }
        });
      });

      await act(async () => {
        await result.current.handleLogin({ preventDefault: vi.fn() });
      });

      expect(loginUser).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      expect(result.current.error).toBe('');
    });

    it('deve mostrar erro quando email não é verificado', async () => {
      const mockUser = { uid: '123', email: 'test@test.com', emailVerified: false };
      loginUser.mockResolvedValue({ success: true, user: mockUser });
      validateFormField.mockReturnValue({ valid: true });

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@test.com' }
        });
        result.current.handleChange({
          target: { name: 'password', value: 'password123' }
        });
      });

      await act(async () => {
        await result.current.handleLogin({ preventDefault: vi.fn() });
      });

      expect(result.current.error).toBe('Verifique seu email antes de fazer login. Um novo email de verificação foi enviado.');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('deve mostrar erro quando login falha', async () => {
      loginUser.mockResolvedValue({
        success: false,
        message: 'Usuário não encontrado'
      });
      validateFormField.mockReturnValue({ valid: true });

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@test.com' }
        });
        result.current.handleChange({
          target: { name: 'password', value: 'password123' }
        });
      });

      await act(async () => {
        await result.current.handleLogin({ preventDefault: vi.fn() });
      });

      expect(result.current.error).toBe('Usuário não encontrado');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('deve validar formulário antes de fazer login', async () => {
      validateFormField.mockReturnValue({ valid: false, error: 'Email inválido' });

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'invalid-email' }
        });
      });

      await act(async () => {
        await result.current.handleLogin({ preventDefault: vi.fn() });
      });

      expect(loginUser).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Email inválido');
    });

    it('deve limpar erro quando form muda', async () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@test.com' }
        });
      });

      await waitFor(() => {
        expect(result.current.error).toBe('');
      });
    });
  });

  describe('handleForgotPassword', () => {
    it('deve enviar email de redefinição com sucesso', async () => {
      resetPassword.mockResolvedValue({ success: true });
      validateFormField.mockReturnValue({ valid: true });

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@test.com' }
        });
      });

      await act(async () => {
        await result.current.handleForgotPassword();
      });

      expect(resetPassword).toHaveBeenCalledWith('test@test.com');
      expect(result.current.resetEmailSent).toBe(true);
      expect(result.current.resetError).toBe('');
    });

    it('deve mostrar erro quando email é inválido', async () => {
      validateFormField.mockReturnValue({
        valid: false,
        error: 'Email inválido'
      });

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'invalid-email' }
        });
      });

      await act(async () => {
        await result.current.handleForgotPassword();
      });

      expect(resetPassword).not.toHaveBeenCalled();
      expect(result.current.resetError).toBe('Email inválido');
    });

    it('deve mostrar erro quando resetPassword falha', async () => {
      resetPassword.mockResolvedValue({
        success: false,
        message: 'Usuário não encontrado'
      });
      validateFormField.mockReturnValue({ valid: true });

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@test.com' }
        });
      });

      await act(async () => {
        await result.current.handleForgotPassword();
      });

      expect(result.current.resetError).toBe('Usuário não encontrado');
      expect(result.current.resetEmailSent).toBe(false);
    });
  });
});
