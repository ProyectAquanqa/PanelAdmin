import React from 'react';

/**
 * Componente para los botones de acción del formulario
 */
const FormActions = ({ isSubmitting, onCancel, isEditing, isDark, saveText = 'Guardar Cambios', createText = 'Crear' }) => {
  return (
    <div className="flex justify-end space-x-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-colors
          ${ isDark 
            ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600' 
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
          } 
          ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white transition-colors
          ${ isDark 
            ? 'bg-primary-600 hover:bg-primary-700' 
            : 'bg-primary-600 hover:bg-primary-700'
          } 
          ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? (
          <>
            <span className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            <span>{isEditing ? 'Guardando...' : 'Creando...'}</span>
          </>
        ) : (
          isEditing ? saveText : createText
        )}
      </button>
    </div>
  );
};

export default FormActions; 