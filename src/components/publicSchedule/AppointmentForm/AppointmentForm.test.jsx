// ============================================
// 📁 src/components/publicSchedule/AppointmentForm/AppointmentForm.test.jsx
// Testes para componente AppointmentForm
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AppointmentForm from './AppointmentForm';

// Mock do hook useAppointmentForm
const mockUseAppointmentForm = {
  formState: {
    patientName: '',
    patientWhatsapp: '',
    appointmentType: 'online',
    location: ''
  },
  config: {
    showAppointmentType: true,
    showLocation: false,
    showPrice: false,
    isFixed: false,
    availableLocations: []
  },
  computed: {
    slotAppointmentType: null
  },
  handlers: {
    setPatientName: vi.fn(),
    handleWhatsappChange: vi.fn(),
    handleWhatsappBlur: vi.fn(),
    handleAppointmentTypeChange: vi.fn(),
    setLocation: vi.fn(),
    handleSubmit: vi.fn((e) => {
      e.preventDefault();
    })
  }
};

vi.mock('../../../hooks/publicSchedule/useAppointmentForm', () => ({
  useAppointmentForm: () => mockUseAppointmentForm
}));

describe('AppointmentForm', () => {
  const defaultProps = {
    selectedSlot: { date: '2024-01-15', time: '10:00' },
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    isSubmitting: false,
    doctor: { whatsapp: '11987654321' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock form state
    mockUseAppointmentForm.formState = {
      patientName: '',
      patientWhatsapp: '',
      appointmentType: 'online',
      location: ''
    };
  });

  it('deve renderizar formulário com slot selecionado', () => {
    render(<AppointmentForm {...defaultProps} />);
    
    expect(screen.getByText('Solicitar agendamento')).toBeInTheDocument();
    expect(screen.getByText(/15 de janeiro de 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/10:00/i)).toBeInTheDocument();
  });

  it('deve renderizar campo de nome', () => {
    render(<AppointmentForm {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/nome completo/i);
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toBeRequired();
  });

  it('deve renderizar campo de WhatsApp', () => {
    render(<AppointmentForm {...defaultProps} />);
    
    const whatsappLabel = screen.getByText(/whatsapp/i);
    expect(whatsappLabel).toBeInTheDocument();
    
    const whatsappInput = screen.getByPlaceholderText('(11) 98888-8888');
    expect(whatsappInput).toBeInTheDocument();
  });

  it('deve atualizar nome quando digitado', () => {
    const setPatientName = vi.fn();
    mockUseAppointmentForm.handlers.setPatientName = setPatientName;
    mockUseAppointmentForm.formState.patientName = 'João Silva';
    
    render(<AppointmentForm {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/nome completo/i);
    fireEvent.change(nameInput, { target: { value: 'Maria Santos' } });
    
    expect(setPatientName).toHaveBeenCalledWith('Maria Santos');
  });

  it('deve mostrar botão de submit', () => {
    render(<AppointmentForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /solicitar consulta/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('deve mostrar botão de cancelar', () => {
    render(<AppointmentForm {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toHaveAttribute('type', 'button');
  });

  it('deve chamar onCancel quando botão cancelar é clicado', () => {
    const onCancel = vi.fn();
    render(<AppointmentForm {...defaultProps} onCancel={onCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar loading state quando isSubmitting é true', () => {
    render(<AppointmentForm {...defaultProps} isSubmitting={true} />);
    
    const submitButton = screen.getByRole('button', { name: /agendando/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('deve desabilitar botão cancelar quando isSubmitting é true', () => {
    render(<AppointmentForm {...defaultProps} isSubmitting={true} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    expect(cancelButton).toBeDisabled();
  });

  it('deve renderizar aviso de privacidade', () => {
    render(<AppointmentForm {...defaultProps} />);
    
    expect(screen.getByText(/seus dados serão usados apenas/i)).toBeInTheDocument();
  });

  it('deve renderizar tipo de atendimento quando configurado', () => {
    mockUseAppointmentForm.config.showAppointmentType = true;
    mockUseAppointmentForm.computed.slotAppointmentType = null;
    
    render(<AppointmentForm {...defaultProps} />);
    
    const appointmentTypeSelect = screen.getByLabelText(/tipo de atendimento/i);
    expect(appointmentTypeSelect).toBeInTheDocument();
  });

  it('deve chamar handleSubmit quando formulário é submetido', () => {
    const handleSubmit = vi.fn((e) => {
      e.preventDefault();
    });
    mockUseAppointmentForm.handlers.handleSubmit = handleSubmit;
    
    render(<AppointmentForm {...defaultProps} />);
    
    const form = screen.getByRole('form') || screen.getByText('Solicitar agendamento').closest('form');
    fireEvent.submit(form);
    
    expect(handleSubmit).toHaveBeenCalled();
  });
});
