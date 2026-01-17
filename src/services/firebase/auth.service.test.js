// ============================================
// 📁 src/services/firebase/auth.service.test.js
// Testes para serviço de autenticação
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword
} from './auth.service';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './config';

// Mock do Firebase Auth
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendEmailVerification: vi.fn(),
  sendPasswordResetEmail: vi.fn()
}));

vi.mock('./config', () => ({
  auth: {}
}));

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('deve registrar usuário com sucesso', async () => {
      const mockUser = { uid: '123', email: 'test@test.com' };
      const mockUserCredential = { user: mockUser };
      
      createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      sendEmailVerification.mockResolvedValue();

      const result = await registerUser('test@test.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@test.com',
        'password123'
      );
      expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
    });

    it('deve retornar erro para email já cadastrado', async () => {
      const error = { code: 'auth/email-already-in-use' };
      createUserWithEmailAndPassword.mockRejectedValue(error);

      const result = await registerUser('existing@test.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('auth/email-already-in-use');
      expect(result.message).toBe('Este email já está cadastrado');
    });

    it('deve retornar erro para email inválido', async () => {
      const error = { code: 'auth/invalid-email' };
      createUserWithEmailAndPassword.mockRejectedValue(error);

      const result = await registerUser('invalid-email', 'password123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email inválido');
    });

    it('deve retornar erro para senha fraca', async () => {
      const error = { code: 'auth/weak-password' };
      createUserWithEmailAndPassword.mockRejectedValue(error);

      const result = await registerUser('test@test.com', '123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Senha muito fraca');
    });

    it('deve retornar mensagem genérica para erro desconhecido', async () => {
      const error = { code: 'auth/unknown-error' };
      createUserWithEmailAndPassword.mockRejectedValue(error);

      const result = await registerUser('test@test.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Erro ao processar autenticação');
    });
  });

  describe('loginUser', () => {
    it('deve fazer login com sucesso', async () => {
      const mockUser = { uid: '123', email: 'test@test.com' };
      const mockUserCredential = { user: mockUser };
      
      signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);

      const result = await loginUser('test@test.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@test.com',
        'password123'
      );
    });

    it('deve retornar erro para usuário não encontrado', async () => {
      const error = { code: 'auth/user-not-found' };
      signInWithEmailAndPassword.mockRejectedValue(error);

      const result = await loginUser('notfound@test.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('auth/user-not-found');
      expect(result.message).toBe('Usuário não encontrado');
    });

    it('deve retornar erro para senha incorreta', async () => {
      const error = { code: 'auth/wrong-password' };
      signInWithEmailAndPassword.mockRejectedValue(error);

      const result = await loginUser('test@test.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Senha incorreta');
    });

    it('deve retornar erro para email inválido', async () => {
      const error = { code: 'auth/invalid-email' };
      signInWithEmailAndPassword.mockRejectedValue(error);

      const result = await loginUser('invalid-email', 'password123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email inválido');
    });
  });

  describe('logoutUser', () => {
    it('deve fazer logout com sucesso', async () => {
      firebaseSignOut.mockResolvedValue();

      const result = await logoutUser();

      expect(result.success).toBe(true);
      expect(firebaseSignOut).toHaveBeenCalledWith(auth);
    });

    it('deve retornar erro quando logout falha', async () => {
      const error = { code: 'auth/logout-failed' };
      firebaseSignOut.mockRejectedValue(error);

      const result = await logoutUser();

      expect(result.success).toBe(false);
      expect(result.error).toBe('auth/logout-failed');
    });
  });

  describe('resetPassword', () => {
    it('deve enviar email de redefinição com sucesso', async () => {
      sendPasswordResetEmail.mockResolvedValue();

      const result = await resetPassword('test@test.com');

      expect(result.success).toBe(true);
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'test@test.com');
    });

    it('deve retornar erro quando email não existe', async () => {
      const error = { code: 'auth/user-not-found' };
      sendPasswordResetEmail.mockRejectedValue(error);

      const result = await resetPassword('notfound@test.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('auth/user-not-found');
    });

    it('deve retornar erro para email inválido', async () => {
      const error = { code: 'auth/invalid-email' };
      sendPasswordResetEmail.mockRejectedValue(error);

      const result = await resetPassword('invalid-email');

      expect(result.success).toBe(false);
      expect(result.error).toBe('auth/invalid-email');
    });
  });
});
