import { format, parseISO, isBefore, startOfToday, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha ISO a formato local
 * @param {string} dateString - Fecha en formato ISO
 * @param {string} formatString - Formato a aplicar (por defecto: dd/MM/yyyy)
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString, formatString = 'dd/MM/yyyy') => {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    
    if (!isValid(date)) {
      console.warn('Fecha inválida:', dateString);
      return dateString;
    }
    
    return format(date, formatString, { locale: es });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return dateString;
  }
};

/**
 * Formatea una fecha ISO a formato largo
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada en formato largo
 */
export const formatDateLong = (dateString) => {
  return formatDate(dateString, "EEEE, d 'de' MMMM 'de' yyyy");
};

/**
 * Determina si una fecha está en el pasado
 * @param {string} dateString - Fecha en formato ISO
 * @returns {boolean} true si la fecha está en el pasado
 */
export const isPastDate = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = parseISO(dateString);
    
    if (!isValid(date)) {
      console.warn('Fecha inválida:', dateString);
      return false;
    }
    
    return isBefore(date, startOfToday());
  } catch (error) {
    console.error('Error al verificar si la fecha está en el pasado:', error);
    return false;
  }
};

/**
 * Determina si una fecha es hoy
 * @param {string} dateString - Fecha en formato ISO
 * @returns {boolean} true si la fecha es hoy
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = parseISO(dateString);
    
    if (!isValid(date)) {
      console.warn('Fecha inválida:', dateString);
      return false;
    }
    
    const today = startOfToday();
    
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    console.error('Error al verificar si la fecha es hoy:', error);
    return false;
  }
};

/**
 * Determina si un bloque horario está en el pasado
 * @param {string} dateString - Fecha en formato ISO
 * @param {string} timeBlock - Bloque horario (MORNING, AFTERNOON)
 * @returns {boolean} true si el bloque horario está en el pasado
 */
export const isTimeBlockPast = (dateString, timeBlock) => {
  if (!dateString || !timeBlock) return false;
  
  try {
    // Si la fecha está en el pasado, el bloque horario también lo está
    if (isPastDate(dateString)) {
      return true;
    }
    
    // Si es hoy, depende del bloque horario
    if (isToday(dateString)) {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Mañana: 8:00 - 12:00, Tarde: 14:00 - 18:00
      if (timeBlock === 'MORNING' && currentHour >= 12) {
        return true;
      }
      if (timeBlock === 'AFTERNOON' && currentHour >= 18) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar si el bloque horario está en el pasado:', error);
    return false;
  }
};

/**
 * Formatea un bloque horario a un formato legible.
 * @param {string} timeBlock - El bloque horario (ej. 'MORNING').
 * @returns {string} El bloque horario formateado.
 */
export const formatTimeBlock = (timeBlock) => {
  const timeBlockMap = {
    MORNING: 'Mañana (8:00 AM - 12:00 PM)',
    AFTERNOON: 'Tarde (2:00 PM - 6:00 PM)',
  };
  return timeBlockMap[timeBlock] || 'No especificado';
}; 