import { adminApiClient } from '../../api';
import { API_ROUTES } from '../../config/api';

/**
 * Obtiene la lista de citas
 */
export const getAppointments = async (params = {}) => {
  try {
    const response = await adminApiClient.get(API_ROUTES.APPOINTMENTS.LIST, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

/**
 * Obtiene las citas del día de hoy
 */
export const getTodayAppointments = async () => {
  try {
    const response = await adminApiClient.get(API_ROUTES.APPOINTMENTS.TODAY);
    return response.data;
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    throw error;
  }
};

/**
 * Obtiene las citas próximas
 */
export const getUpcomingAppointments = async () => {
  try {
    const response = await adminApiClient.get(API_ROUTES.APPOINTMENTS.UPCOMING);
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    throw error;
  }
};

/**
 * Obtiene una cita por su ID
 */
export const getAppointmentById = async (id) => {
  try {
    const response = await adminApiClient.get(`${API_ROUTES.APPOINTMENTS.LIST}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva cita
 */
export const createAppointment = async (appointmentData) => {
  try {
    const response = await adminApiClient.post(API_ROUTES.APPOINTMENTS.CREATE, appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

/**
 * Actualiza una cita existente
 */
export const updateAppointment = async (id, appointmentData) => {
  try {
    const response = await adminApiClient.put(`${API_ROUTES.APPOINTMENTS.LIST}${id}/`, appointmentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Cancela una cita
 */
export const cancelAppointment = async (id, cancelData = {}) => {
  try {
    const response = await adminApiClient.post(`${API_ROUTES.APPOINTMENTS.LIST}${id}/cancel/`, cancelData);
    return response.data;
  } catch (error) {
    console.error(`Error canceling appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Reprograma una cita
 */
export const rescheduleAppointment = async (id, rescheduleData) => {
  try {
    const response = await adminApiClient.post(`${API_ROUTES.APPOINTMENTS.LIST}${id}/reschedule/`, rescheduleData);
    return response.data;
  } catch (error) {
    console.error(`Error rescheduling appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Marca una cita como completada
 */
export const completeAppointment = async (id) => {
  try {
    const response = await adminApiClient.post(`${API_ROUTES.APPOINTMENTS.LIST}${id}/mark_as_completed/`);
    return response.data;
  } catch (error) {
    console.error(`Error completing appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Marca una cita como no presentada
 */
export const markNoShow = async (id) => {
  try {
    const response = await adminApiClient.post(`${API_ROUTES.APPOINTMENTS.LIST}${id}/mark_as_no_show/`);
    return response.data;
  } catch (error) {
    console.error(`Error marking appointment ${id} as no-show:`, error);
    throw error;
  }
};

/**
 * Obtiene las citas de un paciente específico
 */
export const getAppointmentsByPatient = async (patientId) => {
  if (!patientId) {
    throw new Error('El ID del paciente es requerido');
  }
  try {
    const response = await adminApiClient.get(API_ROUTES.APPOINTMENTS.LIST, { params: { patient_id: patientId } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching appointments for patient ${patientId}:`, error);
    throw error;
  }
}; 