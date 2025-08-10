/**
 * Página de Importación de Usuarios
 * Implementa el patrón modular mejorado siguiendo KnowledgeBase
 */

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../hooks/useUsers";
import toast from "react-hot-toast";

// Componentes modulares
import {
  ImportPreviewTable,
  LoadingStates
} from "../../components/Users";

/**
 * Página de importación masiva de usuarios
 * Siguiendo el patrón de KnowledgeBase
 */
const UserImportManagement = () => {
  const navigate = useNavigate();
  const { bulkCreateUsers } = useUsers();

  // Estados de la importación
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('upload'); // 'upload', 'preview', 'importing', 'complete'

  // Handler para selección de archivo
  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return;

    // Validar tipo de archivo
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV');
      return;
    }

    setFile(selectedFile);
    processFile(selectedFile);
  }, []);

  // Procesar archivo y generar preview
  const processFile = useCallback(async (selectedFile) => {
    setLoading(true);
    setValidationErrors([]);

    try {
      // Aquí implementarías la lógica para procesar el archivo
      // Por ahora simulamos datos de ejemplo
      
      const mockPreviewData = [
        {
          row: 1,
          dni: '12345678',
          first_name: 'Juan',
          last_name: 'Pérez',
          email: 'juan.perez@empresa.com',
          perfil: 'Empleado',
          departamento: 'Ventas',
          errors: []
        },
        {
          row: 2,
          dni: '87654321',
          first_name: 'María',
          last_name: 'García',
          email: 'maria.garcia@empresa.com',
          perfil: 'Admin',
          departamento: 'IT',
          errors: ['Email ya existe en el sistema']
        }
      ];

      setPreviewData(mockPreviewData);
      setStep('preview');

      // Contar errores
      const errors = mockPreviewData.filter(row => row.errors.length > 0);
      if (errors.length > 0) {
        setValidationErrors(errors);
        toast.warning(`Se encontraron ${errors.length} errores en los datos`);
      } else {
        toast.success('Archivo procesado correctamente');
      }

    } catch (error) {
      console.error('Error al procesar archivo:', error);
      toast.error('Error al procesar el archivo');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handler para confirmar importación
  const handleConfirmImport = useCallback(async () => {
    const validRows = previewData.filter(row => row.errors.length === 0);
    
    if (validRows.length === 0) {
      toast.error('No hay filas válidas para importar');
      return;
    }

    setStep('importing');
    setLoading(true);

    try {
      // Convertir datos al formato esperado por el backend
      const usersToImport = validRows.map(row => ({
        username: row.dni,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        departamento: row.departamento,
        // Agregar otros campos necesarios
      }));

      await bulkCreateUsers(usersToImport);
      
      setStep('complete');
      toast.success(`${validRows.length} usuarios importados exitosamente`);
      
      // Redirigir después de un momento
      setTimeout(() => {
        navigate('/usuarios/gestion');
      }, 2000);

    } catch (error) {
      console.error('Error al importar usuarios:', error);
      toast.error('Error al importar usuarios');
      setStep('preview');
    } finally {
      setLoading(false);
    }
  }, [previewData, bulkCreateUsers, navigate]);

  // Handler para cancelar y volver
  const handleCancel = useCallback(() => {
    navigate('/usuarios/gestion');
  }, [navigate]);

  // Handler para reiniciar proceso
  const handleRestart = useCallback(() => {
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setStep('upload');
  }, []);

  // Renderizar según el paso actual
  const renderContent = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                  <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Importar Usuarios
                </h3>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Selecciona un archivo Excel o CSV con los datos de usuarios
                </p>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Haz clic para seleccionar archivo
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Excel (.xlsx, .xls) o CSV
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Vista Previa de Importación
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Revisa los datos antes de importar
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                >
                  Seleccionar Otro Archivo
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={previewData.filter(row => row.errors.length === 0).length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Importación
                </button>
              </div>
            </div>

            <ImportPreviewTable
              data={previewData}
              validationErrors={validationErrors}
            />
          </div>
        );

      case 'importing':
        return (
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Importando Usuarios...
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Por favor espera mientras procesamos los datos
              </p>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                ¡Importación Completada!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Los usuarios han sido importados exitosamente
              </p>
              <button
                onClick={() => navigate('/usuarios/gestion')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Ver Usuarios
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && step === 'upload') {
    return <LoadingStates type="page" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Importación de Usuarios
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Importa usuarios masivamente desde archivo Excel o CSV
          </p>
        </div>
        
        {step !== 'complete' && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
          >
            Cancelar
          </button>
        )}
      </div>

      {/* Contenido principal */}
      {renderContent()}
    </div>
  );
};

export default UserImportManagement;