// ============================================
// 📁 src/hooks/appointments/usePublicSchedule.integration.test.js
// Testes de integração para usePublicSchedule
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePublicSchedule } from './usePublicSchedule';
import { getDoctorBySlug } from '../../services/firebase/doctors.service';
import { getAvailability } from '../../services/firebase/availability.service';
import { getAppointmentsByDoctor } from '../../services/firebase/appointments.service';
import { createPublicAppointment as createPublicAppointmentService } from '../../services/appointments/publicAppointment.service';

// Mock dos serviços - usar caminhos absolutos ou relativos corretos
vi.mock('../../services/firebase/doctors.service', () => ({
  getDoctorBySlug: vi.fn(),
}));

vi.mock('../../services/firebase/availability.service', () => ({
  getAvailability: vi.fn(),
}));

vi.mock('../../services/firebase/appointments.service', () => ({
  getAppointmentsByDoctor: vi.fn(),
}));

vi.mock('../../services/appointments/publicAppointment.service', () => ({
  createPublicAppointment: vi.fn(),
}));

describe('usePublicSchedule Integration', () => {
  const mockDoctor = {
    id: 'doctor-123',
    slug: 'dr-teste',
    name: 'Dr. Teste',
    whatsapp: '11987654321',
    plan: 'free',
    appointmentTypeConfig: {
      mode: 'allow_choice',
      fixedType: 'online',
      defaultValueOnline: 0,
      defaultValuePresencial: 0,
      locations: [],
    },
    publicScheduleConfig: {
      period: 'all_future',
    },
  };

  const mockAvailability = [
    {
      id: 'avail-1',
      doctorId: 'doctor-123',
      date: '2024-01-15',
      slots: ['10:00', '11:00', '14:00'],
    },
  ];

  const mockAppointments = [];

  beforeEach(() => {
    vi.clearAllMocks();
    
    getDoctorBySlug.mockResolvedValue({
      success: true,
      data: mockDoctor,
    });

    getAvailability.mockResolvedValue({
      success: true,
      data: mockAvailability,
    });

    getAppointmentsByDoctor.mockResolvedValue({
      success: true,
      data: mockAppointments,
    });
  });

  it('deve buscar médico por slug ao inicializar', async () => {
    const { result } = renderHook(() => usePublicSchedule('dr-teste'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getDoctorBySlug).toHaveBeenCalledWith('dr-teste');
    expect(result.current.doctor).toEqual(mockDoctor);
  });

  it('deve buscar disponibilidade do médico', async () => {
    const { result } = renderHook(() => usePublicSchedule('dr-teste'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getAvailability).toHaveBeenCalledWith('doctor-123');
    expect(result.current.availability).toBeDefined();
  });

  it('deve buscar agendamentos do médico', async () => {
    const { result } = renderHook(() => usePublicSchedule('dr-teste'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getAppointmentsByDoctor).toHaveBeenCalledWith('doctor-123');
  });

  it('deve criar agendamento com dados corretos', async () => {
    createPublicAppointmentService.mockResolvedValue({
      success: true,
      appointmentId: 'appt-123',
      message: 'Agendamento criado com sucesso',
    });

    const { result } = renderHook(() => usePublicSchedule('dr-teste'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Selecionar slot
    await act(async () => {
      result.current.handleSlotSelect(
        { id: 'avail-1', date: '2024-01-15', slots: ['10:00'] },
        '10:00'
      );
    });

    expect(result.current.selectedSlot).toBeDefined();
    expect(result.current.selectedSlot.date).toBe('2024-01-15');
    expect(result.current.selectedSlot.time).toBe('10:00');

    // Criar agendamento
    const formData = {
      patientName: 'João Silva',
      patientWhatsapp: '11987654321',
      appointmentType: 'online',
    };

    await act(async () => {
      const appointmentResult = await result.current.createAppointment(formData);
      expect(appointmentResult.success).toBe(true);
    });

    expect(createPublicAppointmentService).toHaveBeenCalledWith(
      expect.objectContaining({
        doctorSlug: 'dr-teste',
        date: '2024-01-15',
        time: '10:00',
        patientName: 'João Silva',
        patientWhatsapp: '11987654321',
        appointmentType: 'online',
      })
    );
  });

  it('deve filtrar disponibilidade corretamente', async () => {
    const { result } = renderHook(() => usePublicSchedule('dr-teste'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.availability).toBeDefined();
    expect(Array.isArray(result.current.availability)).toBe(true);
  });

  it('deve calcular limite de agendamentos corretamente', async () => {
    const { result } = renderHook(() => usePublicSchedule('dr-teste'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.limitReached).toBeDefined();
    expect(typeof result.current.limitReached).toBe('boolean');
  });

  it('deve retornar erro quando médico não é encontrado', async () => {
    getDoctorBySlug.mockResolvedValue({
      success: false,
      error: 'Médico não encontrado',
    });

    const { result } = renderHook(() => usePublicSchedule('slug-invalido'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Médico não encontrado');
    expect(result.current.doctor).toBeNull();
  });

  it('deve lidar com erro ao criar agendamento', async () => {
    createPublicAppointmentService.mockResolvedValue({
      success: false,
      error: 'Erro ao criar agendamento',
    });

    const { result } = renderHook(() => usePublicSchedule('dr-teste'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.handleSlotSelect(
        { id: 'avail-1', date: '2024-01-15', slots: ['10:00'] },
        '10:00'
      );
    });

    const formData = {
      patientName: 'João Silva',
      patientWhatsapp: '11987654321',
    };

    await act(async () => {
      const appointmentResult = await result.current.createAppointment(formData);
      expect(appointmentResult.success).toBe(false);
      expect(appointmentResult.error).toBe('Erro ao criar agendamento');
    });
  });

  it('deve selecionar slot corretamente', async () => {
    const { result } = renderHook(() => usePublicSchedule('dr-teste'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const day = { id: 'avail-1', date: '2024-01-15', slots: ['10:00', '11:00'] };

    await act(async () => {
      result.current.handleSlotSelect(day, '10:00');
    });

    expect(result.current.selectedSlot).toBeDefined();
    expect(result.current.selectedSlot.date).toBe('2024-01-15');
    expect(result.current.selectedSlot.time).toBe('10:00');
  });
});
