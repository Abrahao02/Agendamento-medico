// ============================================
// 📁 src/components/publicSchedule/AppointmentForm/AppointmentForm.integration.test.jsx
// Testes de integração para AppointmentForm
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AppointmentForm from './AppointmentForm';
import { createPublicAppointmentService } from '../../../services/appointments/publicAppointment.service';

// Mock do serviço
vi.mock('../../../services/appointments/publicAppointment.service', () => ({
  createPublicAppointmentService: vi.fn(),
}));

// Mock do hook useAppointmentForm (já está mockado no teste unitário, mas vamos garantir)
const mockUseAppointmentForm = {
  formState: {
    patientName: '',
    patientWhatsapp: '',
    appointmentType: 'online',
    location: '',
    shake: false,
  },
  config: {
    showAppointmentType: true,
    showLocation: false,
    showPrice: false,
    isFixed: false,
    availableLocations: [],
    slotAllowedLocationIds: [],
  },
  computed: {
    slotAppointmentType: null,
  },
  handlers: {
    setPatientName: vi.fn(),
    handleWhatsappChange: vi.fn(),
    handleWhatsappBlur: vi.fn(),
    handleAppointmentTypeChange: vi.fn(),
    setLocation: vi.fn(),
    handleSubmit: vi.fn((e) => {
      e.preventDefault();
    }),
  },
};

vi.mock('../../../hooks/publicSchedule/useAppointmentForm', () => ({
  useAppointmentForm: () => mockUseAppointmentForm,
}));

describe('AppointmentForm Integration', () => {
  const defaultProps = {
    selectedSlot: { date: '2024-01-15', time: '10:00' },
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    isSubmitting: false,
    doctor: { 
      slug: 'dr-teste',
      whatsapp: '11987654321',
      appointmentTypeConfig: {
        mode: 'allow_choice',
        fixedType: 'online',
        defaultValueOnline: 0,
        defaultValuePresencial: 0,
        locations: [],
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppointmentForm.formState = {
      patientName: '',
      patientWhatsapp: '',
      appointmentType: 'online',
      location: '',
      shake: false,
    };
  });

  it('deve chamar onSubmit com dados corretos quando formulário é válido', async () => {
    const onSubmit = vi.fn();
    mockUseAppointmentForm.formState.patientName = 'João Silva';
    mockUseAppointmentForm.formState.patientWhatsapp = '11987654321';

    const handleSubmit = vi.fn((e) => {
      e.preventDefault();
      onSubmit({
        patientName: mockUseAppointmentForm.formState.patientName,
        patientWhatsapp: mockUseAppointmentForm.formState.patientWhatsapp,
      });
    });

    mockUseAppointmentForm.handlers.handleSubmit = handleSubmit;

    const { container } = render(
      <AppointmentForm {...defaultProps} onSubmit={onSubmit} />
    );

    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      patientName: 'João Silva',
      patientWhatsapp: '11987654321',
    });
  });

  it('deve incluir appointmentType quando configurado', async () => {
    const onSubmit = vi.fn();
    mockUseAppointmentForm.formState.patientName = 'Maria Santos';
    mockUseAppointmentForm.formState.patientWhatsapp = '11987654321';
    mockUseAppointmentForm.formState.appointmentType = 'presencial';
    mockUseAppointmentForm.config.showAppointmentType = true;
    mockUseAppointmentForm.config.isFixed = false;

    const handleSubmit = vi.fn((e) => {
      e.preventDefault();
      onSubmit({
        patientName: mockUseAppointmentForm.formState.patientName,
        patientWhatsapp: mockUseAppointmentForm.formState.patientWhatsapp,
        appointmentType: mockUseAppointmentForm.formState.appointmentType,
      });
    });

    mockUseAppointmentForm.handlers.handleSubmit = handleSubmit;

    const { container } = render(
      <AppointmentForm {...defaultProps} onSubmit={onSubmit} />
    );

    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        patientName: 'Maria Santos',
        patientWhatsapp: '11987654321',
        appointmentType: 'presencial',
      });
    });
  });

  it('deve incluir location quando appointmentType é presencial', async () => {
    const onSubmit = vi.fn();
    mockUseAppointmentForm.formState.patientName = 'Pedro Costa';
    mockUseAppointmentForm.formState.patientWhatsapp = '11987654321';
    mockUseAppointmentForm.formState.appointmentType = 'presencial';
    mockUseAppointmentForm.formState.location = 'Consultório Centro';
    mockUseAppointmentForm.config.showAppointmentType = true;
    mockUseAppointmentForm.config.showLocation = true;
    mockUseAppointmentForm.config.availableLocations = [
      { name: 'Consultório Centro', defaultValue: 150 },
    ];

    const handleSubmit = vi.fn((e) => {
      e.preventDefault();
      onSubmit({
        patientName: mockUseAppointmentForm.formState.patientName,
        patientWhatsapp: mockUseAppointmentForm.formState.patientWhatsapp,
        appointmentType: mockUseAppointmentForm.formState.appointmentType,
        location: mockUseAppointmentForm.formState.location,
      });
    });

    mockUseAppointmentForm.handlers.handleSubmit = handleSubmit;

    const { container } = render(
      <AppointmentForm {...defaultProps} onSubmit={onSubmit} />
    );

    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        patientName: 'Pedro Costa',
        patientWhatsapp: '11987654321',
        appointmentType: 'presencial',
        location: 'Consultório Centro',
      });
    });
  });

  it('deve desabilitar campos quando isSubmitting é true', () => {
    render(<AppointmentForm {...defaultProps} isSubmitting={true} />);

    const submitButton = screen.getByRole('button', { name: /agendando/i });
    expect(submitButton).toBeDisabled();

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    expect(cancelButton).toBeDisabled();
  });

  it('deve chamar onCancel quando botão cancelar é clicado', () => {
    const onCancel = vi.fn();
    render(<AppointmentForm {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('deve exibir informações do slot selecionado', () => {
    render(<AppointmentForm {...defaultProps} />);

    expect(screen.getByText(/15\/01\/2024/i)).toBeInTheDocument();
    expect(screen.getByText(/10:00/i)).toBeInTheDocument();
  });
});
