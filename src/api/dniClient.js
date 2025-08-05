/**
 * Cliente especializado para consultas de DNI
 * Maneja la comunicación con la API externa de DNI siguiendo las buenas prácticas
 */

import { api } from '../config/appConfig';

/**
 * Cliente para consultas de DNI a API externa
 */
class DniClient {
  constructor() {
    this.config = api.external.dni;
    this.baseURL = this.config.url;
    this.token = this.config.token;
    this.timeout = this.config.timeout;
  }

  /**
   * Valida configuración requerida
   * @private
   */
  _validateConfig() {
    if (!this.token) {
      throw new Error('Configuración de consulta DNI incompleta');
    }
    if (!this.baseURL) {
      throw new Error('Configuración de consulta DNI incompleta');
    }
  }

  /**
   * Realiza una consulta de DNI
   * @param {string} dni - DNI de 8 dígitos
   * @returns {Promise<Object>} Datos del DNI
   */
  async consultarDni(dni) {
    this._validateConfig();

    // Validación básica del DNI
    if (!dni || typeof dni !== 'string' || dni.length !== 8 || !/^\d+$/.test(dni)) {
      throw new Error('DNI debe ser una cadena de exactamente 8 dígitos numéricos');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [this.config.fieldMapping.request]: dni
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this._handleHttpError(response);
      }

      const data = await response.json();

      // Validar respuesta
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('DNI no encontrado en la base de datos');
      }

      return this._transformResponse(data[0], dni);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado. Intente nuevamente.');
      }
      throw this._transformError(error);
    }
  }

  /**
   * Maneja errores HTTP específicos
   * @private
   * @param {Response} response 
   */
  async _handleHttpError(response) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.detail || errorMessage;
    } catch (parseError) {
      // Mantener mensaje HTTP si no se puede parsear
    }

    switch (response.status) {
      case 401:
      case 403:
        throw new Error('No autorizado para consultar DNI');
      case 404:
        throw new Error('DNI no encontrado en la base de datos');
      case 429:
        throw new Error('Demasiadas consultas. Intente más tarde');
      case 500:
      case 502:
      case 503:
      case 504:
        throw new Error('El servicio de consulta DNI no está disponible en este momento');
      default:
        throw new Error(errorMessage);
    }
  }

  /**
   * Transforma la respuesta de la API externa al formato esperado
   * @private
   * @param {Object} apiResponse - Respuesta de la API externa
   * @param {string} dni - DNI consultado
   * @returns {Object} Respuesta normalizada
   */
  _transformResponse(apiResponse, dni) {
    const mapping = this.config.fieldMapping.response;
    
    const nombres = apiResponse[mapping.nombres] || '';
    const apellidoPaterno = apiResponse[mapping.apellidoPaterno] || '';
    const apellidoMaterno = apiResponse[mapping.apellidoMaterno] || '';

    return {
      status: 'success',
      data: {
        dni,
        nombres,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        full_name: `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.trim()
      }
    };
  }

  /**
   * Transforma errores para consistencia
   * @private
   * @param {Error} error 
   * @returns {Error}
   */
  _transformError(error) {
    // Mantener errores ya transformados
    if (error.message.includes('no encontrado') || 
        error.message.includes('No autorizado') ||
        error.message.includes('no está disponible') ||
        error.message.includes('Tiempo de espera') ||
        error.message.includes('Demasiadas consultas')) {
      return error;
    }

    // Error genérico
    return new Error(error.message || 'Error al consultar DNI');
  }
}

// Exportar instancia singleton
export const dniClient = new DniClient();
export default dniClient;