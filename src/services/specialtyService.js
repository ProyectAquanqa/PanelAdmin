import { adminApiClient } from '../api';
import { API_ROUTES } from '../config/api';

const BASE_URL = API_ROUTES.CATALOGS.SPECIALTIES.LIST;

/**
 * Normaliza la respuesta de especialidades del backend
 */
const normalizeResponse = (data) => {
  if (data && data.results) {
    return data;
  }
  if (Array.isArray(data)) {
    return { results: data, count: data.length };
  }
  return { results: [], count: 0 };
};

/**
 * Obtiene la lista de especialidades
 */
export const getSpecialties = async (params = {}) => {
  try {
    const response = await adminApiClient.get(BASE_URL, { params });
    return normalizeResponse(response.data);
  } catch (error) {
    console.error('Error fetching specialties:', error);
    throw error;
  }
};

/**
 * Obtiene una especialidad por su ID
 */
export const getSpecialtyById = async (id) => {
  try {
    const response = await adminApiClient.get(`${BASE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching specialty ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva especialidad
 */
export const createSpecialty = async (specialtyData) => {
  try {
    const response = await adminApiClient.post(BASE_URL, specialtyData);
    return response.data;
  } catch (error) {
    console.error('Error creating specialty:', error);
    throw error;
  }
};

/**
 * Actualiza una especialidad existente
 */
export const updateSpecialty = async (id, specialtyData) => {
  try {
    const response = await adminApiClient.put(`${BASE_URL}${id}/`, specialtyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating specialty ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una especialidad
 */
export const deleteSpecialty = async (id) => {
  try {
    await adminApiClient.delete(`${BASE_URL}${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting specialty ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de especialidades
 */
export const getSpecialtiesStats = async () => {
  try {
    const response = await adminApiClient.get(`${BASE_URL}stats/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene solo las especialidades activas (para formularios, etc.)
 */
export const getActiveSpecialties = async () => {
  try {
    // Este endpoint ya devuelve solo las especialidades activas.
    const response = await adminApiClient.get(API_ROUTES.APPOINTMENTS.SPECIALTIES);
    return response.data;
  } catch (error) {
    console.error('Error fetching active specialties:', error);
    throw error;
  }
};