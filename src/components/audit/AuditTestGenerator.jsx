import React, { useState } from 'react';
import auditTestService from '../../services/auditTestService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuditTestGenerator = ({ onTestGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const testableModules = [
    'appointments',
    'payments',
    'patients',
    'doctors',
    'settings'
  ];

  const handleGenerateTest = async (module) => {
    setIsLoading(true);
    try {
      const response = await auditTestService.triggerTestEvent(module);
      toast.success(`Log de prueba para '${module}' generado con éxito.`);
      if (onTestGenerated) {
        onTestGenerated(); // Llama a la función para refrescar la lista de logs
      }
    } catch (error) {
      toast.error(`Error al generar log para '${module}': ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
      <ToastContainer />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Generador de Pruebas de Auditoría</h3>
      <p className="text-sm text-gray-600 mb-4">
        Haz clic en un módulo para generar un registro de auditoría de prueba. Esto te permite verificar que el sistema está capturando eventos correctamente.
      </p>
      <div className="flex flex-wrap gap-2">
        {testableModules.map(module => (
          <button
            key={module}
            onClick={() => handleGenerateTest(module)}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generando...' : `Probar '${module.charAt(0).toUpperCase() + module.slice(1)}'`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AuditTestGenerator; 