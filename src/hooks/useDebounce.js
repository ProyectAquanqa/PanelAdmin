import { useState, useEffect } from 'react';

/**
 * Hook para "rebotar" (debounce) un valor.
 * Es útil para evitar llamadas a la API en cada pulsación de tecla.
 * 
 * @param {any} value - El valor a debounced (ej. un término de búsqueda).
 * @param {number} delay - El retraso en milisegundos.
 * @returns {any} El valor debounced.
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configurar un temporizador para actualizar el valor debounced después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el temporizador si el valor cambia (ej. el usuario sigue escribiendo)
    // o si el componente se desmonta.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce; 