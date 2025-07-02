// Importar y reexportar todos los servicios de citas
import * as apiService from './appointmentApiService';
import * as availabilityService from './appointmentAvailabilityService';

// Reexportar todas las funciones
export const {
  getAppointments,
  getTodayAppointments,
  getUpcomingAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
  markNoShow,
  getAppointmentsByPatient
} = apiService;

export const {
  getAvailableSlots,
  getDoctorsBySpecialty,
  getTimeBlockDisplayName
} = availabilityService; 