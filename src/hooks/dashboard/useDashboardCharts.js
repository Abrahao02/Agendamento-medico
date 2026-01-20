// ============================================
// 📁 src/hooks/dashboard/useDashboardCharts.js
// Responsabilidade: Transformação de dados para gráficos
// ============================================

import { useMemo } from "react";
import { STATUS_GROUPS, isStatusInGroup } from "../../constants/appointmentStatus";
import { getMonthName } from "../../constants/months";
import { filterAppointments } from "../../utils/filters/appointmentFilters";
import { createPatientsMap } from "../../utils/patients/createPatientsMap";

export const useDashboardCharts = ({
  filteredAppointments,
  patients,
  appointments,
}) => {
  const chartData = useMemo(() => {
    const byDay = {};
    filteredAppointments.forEach(appointment => {
      if (!byDay[appointment.date]) {
        byDay[appointment.date] = { 
          date: appointment.date, 
          Confirmado: 0, 
          Pendente: 0, 
          "Msg enviada": 0,
          Cancelado: 0,
          "Não Compareceu": 0 
        };
      }
      byDay[appointment.date][appointment.status]++;
    });
    return Object.values(byDay).sort((day1, day2) => day1.date.localeCompare(day2.date));
  }, [filteredAppointments]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    // Filtra apenas appointments ATIVOS
    const activeAppointments = filteredAppointments.filter(appointment => 
      STATUS_GROUPS.ACTIVE.includes(appointment.status)
    );

    // Cria mapa de WhatsApp -> dados atualizados do paciente
    const patientsMap = createPatientsMap(patients);

    return activeAppointments
      .filter(appointment => new Date(`${appointment.date}T${appointment.time || "00:00"}:00`) >= today)
      .sort((apt1, apt2) => new Date(`${apt1.date}T${apt1.time || "00:00"}:00`) - new Date(`${apt2.date}T${apt2.time || "00:00"}:00`))
      .slice(0, 5)
      .map(appointment => {
        // Busca dados atualizados do paciente pelo WhatsApp
        const patient = patientsMap[appointment.patientWhatsapp];
        
        // Se encontrou o paciente, usa o nome preferencial atual ou o nome completo
        if (patient) {
          return {
            ...appointment,
            referenceName: patient.referenceName?.trim() || patient.name
          };
        }
        
        // Se não encontrou, mantém os dados originais do appointment
        return appointment;
      });
  }, [filteredAppointments, patients]);

  const financialChartData = useMemo(() => {
    const byDay = {};
    filteredAppointments.forEach(a => {
      // Apenas appointments confirmados contam para faturamento
      if (isStatusInGroup(a.status, 'CONFIRMED')) {
        if (!byDay[a.date]) {
          byDay[a.date] = { 
            date: a.date, 
            revenue: 0
          };
        }
        const price = a.value || 0;
        byDay[a.date].revenue += Number(price);
      }
    });
    return Object.values(byDay)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        date: item.date,
        revenue: Number(item.revenue.toFixed(2))
      }));
  }, [filteredAppointments]);

  const monthlyData = useMemo(() => {
    const months = [];
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    for (let i = 2; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      
      const monthAppointments = filterAppointments(appointments, {
        selectedMonth: month,
        selectedYear: year,
      });
      
      const revenue = monthAppointments
        .filter(appointment => isStatusInGroup(appointment.status, 'CONFIRMED'))
        .reduce((sum, appointment) => {
          const price = appointment.value || 0;
          return sum + Number(price);
        }, 0);
      
      months.push({
        key: `${year}-${month}`,
        name: getMonthName(month),
        revenue,
        trend: i === 0 ? null : (revenue > months[months.length - 1]?.revenue ? 'up' : 
                                  revenue < months[months.length - 1]?.revenue ? 'down' : 'neutral')
      });
    }
    
    return months;
  }, [appointments]);

  return {
    chartData,
    upcomingAppointments,
    financialChartData,
    monthlyData,
  };
};
