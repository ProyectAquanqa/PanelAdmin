/**
 * Extrae el mensaje de error de una respuesta de error de Axios
 * @param {Error} error - Error de Axios
 * @returns {string} Mensaje de error
 */
export const extractErrorMessage = (error) => {
  // Si el error ya es un string, devolverlo
  if (typeof error === 'string') {
    return error;
  }
  
  // Si el error tiene un mensaje directo
  if (error.message) {
    return error.message;
  }
  
  // Si es un error de Axios con datos de respuesta
  if (error.response?.data) {
    const responseData = error.response.data;
    
    // Si es un mensaje simple
    if (typeof responseData === 'string') {
      return responseData;
    }
    
    // Si es un objeto con un mensaje
    if (responseData.message) {
      return responseData.message;
    }
    
    // Si es un objeto con un error
    if (responseData.error) {
      return responseData.error;
    }
    
    // Si es un objeto con detalles
    if (responseData.detail) {
      return responseData.detail;
    }
    
    // Si es un objeto con errores por campo
    if (typeof responseData === 'object') {
      // Buscar el primer campo con error
      const firstField = Object.keys(responseData)[0];
      
      if (firstField) {
        const firstError = responseData[firstField];
        
        // Si es un array, tomar el primer mensaje
        if (Array.isArray(firstError)) {
          return `${firstField}: ${firstError[0]}`;
        }
        
        // Si es un string, usarlo directamente
        if (typeof firstError === 'string') {
          return `${firstField}: ${firstError}`;
        }
        
        // Si es un objeto, convertirlo a string
        if (typeof firstError === 'object') {
          return `${firstField}: ${JSON.stringify(firstError)}`;
        }
      }
    }
  }
  
  // Si es un error genérico de red
  if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR') {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }
  
  // Si no se puede extraer un mensaje específico
  return 'Error desconocido. Por favor, inténtalo de nuevo.';
};

/**
 * Formatea un error para mostrar en consola
 * @param {Error} error - Error a formatear
 * @returns {Object} Objeto con información del error
 */
export const formatErrorForConsole = (error) => {
  const result = {
    message: extractErrorMessage(error),
    status: error.response?.status,
    statusText: error.response?.statusText,
    url: error.config?.url,
    method: error.config?.method,
  };
  
  // Agregar datos de respuesta si existen
  if (error.response?.data) {
    result.data = error.response.data;
  }
  
  return result;
};

/**
 * Maneja errores de validación de formularios
 * @param {Error} error - Error de validación
 * @param {Object} setError - Función para establecer errores en el formulario
 * @returns {string} Mensaje de error
 */
export const handleFormValidationError = (error, setError) => {
  // Si el error tiene una estructura de campos específica
  if (error.response?.data && typeof error.response.data === 'object') {
    const fieldErrors = error.response.data;
    
    // Recorrer los campos con error
    Object.keys(fieldErrors).forEach(field => {
      // Convertir nombres de campo del backend a nombres de campo del frontend
      const frontendField = field
        .replace('_id', '')
        .replace('_', '');
      
      // Obtener el mensaje de error
      const errorMessage = Array.isArray(fieldErrors[field])
        ? fieldErrors[field][0]
        : fieldErrors[field];
      
      // Establecer el error en el formulario
      setError(frontendField, {
        type: 'manual',
        message: errorMessage
      });
    });
    
    return 'Por favor, corrige los errores en el formulario.';
  }
  
  // Si no hay errores de campo específicos, devolver un mensaje genérico
  return extractErrorMessage(error);
}; 