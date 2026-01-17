// ============================================
// 📁 src/components/patients/AddPatientModal/AddPatientModal.test.jsx
// Testes para componente AddPatientModal
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddPatientModal from './AddPatientModal';

// Mock do hook useModal
const mockUseModal = {
  handlers: {
    handleBackdropClick: vi.fn(),
    handleKeyDown: vi.fn()
  }
};

vi.mock('../../../hooks/common/useModal', () => ({
  useModal: () => mockUseModal
}));

describe('AddPatientModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    newPatient: {
      name: '',
      referenceName: '',
      whatsapp: '',
      price: ''
    },
    updateNewPatientField: vi.fn(),
    handleWhatsappChange: vi.fn(),
    isWhatsappDuplicate: vi.fn(() => false),
    error: null,
    loading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve renderizar quando isOpen é false', () => {
    const { container } = render(<AddPatientModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar modal quando isOpen é true', () => {
    render(<AddPatientModal {...defaultProps} />);
    
    expect(screen.getByText('Adicionar Novo Paciente')).toBeInTheDocument();
  });

  it('deve renderizar campo de nome', () => {
    render(<AddPatientModal {...defaultProps} />);
    
    // Use ID to avoid matching "Nome de Referência"
    const nameInput = screen.getByLabelText(/^Nome\s+\*?$/i) || document.getElementById('patient-name');
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toBeRequired();
  });

  it('deve renderizar campo de nome de referência', () => {
    render(<AddPatientModal {...defaultProps} />);
    
    const referenceNameInput = screen.getByLabelText(/nome de referência/i);
    expect(referenceNameInput).toBeInTheDocument();
  });

  it('deve renderizar campo de WhatsApp', () => {
    render(<AddPatientModal {...defaultProps} />);
    
    const whatsappInput = screen.getByLabelText(/whatsapp/i);
    expect(whatsappInput).toBeInTheDocument();
    expect(whatsappInput).toBeRequired();
  });

  it('deve renderizar campo de preço', () => {
    render(<AddPatientModal {...defaultProps} />);
    
    const priceInput = screen.getByLabelText(/valor da consulta/i);
    expect(priceInput).toBeInTheDocument();
  });

  it('deve atualizar nome quando digitado', () => {
    const updateNewPatientField = vi.fn();
    render(<AddPatientModal {...defaultProps} updateNewPatientField={updateNewPatientField} />);
    
    // Use ID to avoid matching "Nome de Referência"
    const nameInput = document.getElementById('patient-name');
    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    
    expect(updateNewPatientField).toHaveBeenCalledWith('name', 'João Silva');
  });

  it('deve atualizar WhatsApp quando digitado', () => {
    const handleWhatsappChange = vi.fn();
    render(<AddPatientModal {...defaultProps} handleWhatsappChange={handleWhatsappChange} />);
    
    const whatsappInput = screen.getByLabelText(/whatsapp/i);
    fireEvent.change(whatsappInput, { target: { value: '11987654321' } });
    
    expect(handleWhatsappChange).toHaveBeenCalledWith('11987654321');
  });

  it('deve mostrar erro de WhatsApp duplicado', () => {
    const isWhatsappDuplicate = vi.fn(() => true);
    render(
      <AddPatientModal
        {...defaultProps}
        newPatient={{ ...defaultProps.newPatient, whatsapp: '11987654321' }}
        isWhatsappDuplicate={isWhatsappDuplicate}
      />
    );
    
    expect(screen.getByText('WhatsApp já cadastrado')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de erro quando há erro', () => {
    render(<AddPatientModal {...defaultProps} error="Erro ao cadastrar paciente" />);
    
    expect(screen.getByText('Erro ao cadastrar paciente')).toBeInTheDocument();
  });

  it('deve chamar onClose quando botão fechar é clicado', () => {
    const onClose = vi.fn();
    render(<AddPatientModal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Fechar modal');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onClose quando botão cancelar é clicado', () => {
    const onClose = vi.fn();
    render(<AddPatientModal {...defaultProps} onClose={onClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onSubmit quando formulário é submetido', async () => {
    const onSubmit = vi.fn();
    render(<AddPatientModal {...defaultProps} onSubmit={onSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /cadastrar paciente/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('deve mostrar loading state quando loading é true', () => {
    render(<AddPatientModal {...defaultProps} loading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /cadastrando/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('deve desabilitar campos quando loading é true', () => {
    render(<AddPatientModal {...defaultProps} loading={true} />);
    
    // Use IDs to avoid ambiguity
    const nameInput = document.getElementById('patient-name');
    const whatsappInput = document.getElementById('patient-whatsapp');
    
    expect(nameInput).toBeDisabled();
    expect(whatsappInput).toBeDisabled();
  });

  it('deve desabilitar botão fechar quando loading é true', () => {
    render(<AddPatientModal {...defaultProps} loading={true} />);
    
    const closeButton = screen.getByLabelText('Fechar modal');
    expect(closeButton).toBeDisabled();
  });
});
