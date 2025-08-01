/**
 * Página de importación masiva de usuarios
 * Permite descargar plantilla Excel, cargar archivo y previsualizar datos
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadUserTemplate, parseUserExcel, formatDataForTable } from '../../utils/excelUtils';
import { ImportPreviewTable, LoadingStates } from '../../components/Users';
import { useUsers } from '../../hooks/useUsers';

/**
 * Componente principal de importación de usuarios
 */
const UserImport = () => {
  const navigate = useNavigate();
  const { bulkImportUsers } = useUsers();
  
  // Estados
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [parseErrors, setParseErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  /**
   * Maneja la descarga de la plantilla Excel
   */
  const handleDownloadTemplate = useCallback(() => {
    try {
      const result = downloadUserTemplate();
      if (result.success) {
        // Mostrar mensaje de éxito opcional
        console.log(`Plantilla descargada: ${result.fileName}`);
      } else {
        console.error('Error al descargar plantilla:', result.error);
        // Aquí podrías mostrar un toast de error
      }
    } catch (error) {
      console.error('Error inesperado al descargar plantilla:', error);
    }
  }, []);

  /**
   * Maneja la selección de archivo Excel
   */
  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      // Reset si no hay archivo
      setUploadedFile(null);
      setParsedData(null);
      setParseErrors([]);
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Por favor seleccione un archivo Excel válido (.xlsx o .xls)');
      event.target.value = '';
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);
    setParsedData(null);
    setParseErrors([]);

    try {
      const result = await parseUserExcel(file);
      
      if (result.success) {
        const formattedData = formatDataForTable(result.data);
        setParsedData({
          ...result,
          formattedData
        });
        setParseErrors(result.errors || []);
      } else {
        setParseErrors([{ error: result.error, row: 'General' }]);
      }
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      setParseErrors([{ error: 'Error inesperado al procesar el archivo', row: 'General' }]);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Maneja la confirmación de importación
   */
  const handleConfirmImport = useCallback(async () => {
    if (!parsedData || !parsedData.data.length) return;

    setIsImporting(true);
    setImportResults(null);

    try {
      const result = await bulkImportUsers(parsedData.data);
      setImportResults(result);
      
      if (result.success) {
        // Opcional: limpiar datos después de importación exitosa
        setTimeout(() => {
          navigate('/usuarios/gestion');
        }, 3000);
      }
    } catch (error) {
      console.error('Error al importar usuarios:', error);
      setImportResults({
        success: false,
        error: 'Error inesperado durante la importación'
      });
    } finally {
      setIsImporting(false);
    }
  }, [parsedData, bulkImportUsers, navigate]);

  /**
   * Navega de regreso a la gestión de usuarios
   */
  const handleGoBack = useCallback(() => {
    navigate('/usuarios/gestion');
  }, [navigate]);

  /**
   * Limpia los datos cargados
   */
  const handleClearData = useCallback(() => {
    setUploadedFile(null);
    setParsedData(null);
    setParseErrors([]);
    setImportResults(null);
    // Limpiar input file
    const fileInput = document.getElementById('excel-file-input');
    if (fileInput) fileInput.value = '';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Regresar
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Importar Usuarios</h1>
                <p className="text-sm text-gray-500">Carga masiva de usuarios desde archivo Excel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-lg hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar Formato
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          
          {/* Upload Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Seleccionar archivo Excel</h2>
              <p className="text-sm text-gray-600">
                Seleccione el archivo Excel con los datos de usuarios. 
                <button 
                  onClick={handleDownloadTemplate}
                  className="text-slate-600 hover:text-slate-800 underline ml-1"
                >
                  Descargar plantilla
                </button> si no tiene el formato correcto.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  id="excel-file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 file:cursor-pointer"
                />
              </div>
              
              {uploadedFile && (
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
            
            {uploadedFile && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Archivo seleccionado:</span> {uploadedFile.name}
                  <span className="text-slate-500 ml-2">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                </p>
              </div>
            )}
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <LoadingStates.ProcessingFile />
            </div>
          )}

          {/* Parse Errors */}
          {parseErrors.length > 0 && (
            <div className="bg-white rounded-lg border border-red-200 p-6">
              <div className="flex items-center mb-4">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-semibold text-red-700">Errores encontrados en el archivo</h3>
              </div>
              <div className="space-y-2">
                {parseErrors.map((error, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Fila {error.row}:</span> {error.error}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Section */}
          {parsedData && parsedData.formattedData.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">2. Previsualización de datos</h2>
                  <p className="text-sm text-gray-600">
                    Se encontraron <span className="font-medium text-slate-600">{parsedData.validRows}</span> usuarios válidos 
                    de <span className="font-medium">{parsedData.totalRows}</span> filas procesadas
                  </p>
                </div>
                
                <button
                  onClick={handleConfirmImport}
                  disabled={isImporting || parsedData.validRows === 0}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isImporting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Confirmar Importación
                    </>
                  )}
                </button>
              </div>
              
              {/* Tabla de previsualización */}
              <ImportPreviewTable
                data={parsedData.formattedData}
                errors={parseErrors}
                isLoading={false}
              />
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <div className={`rounded-lg border p-6 ${
              importResults.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center mb-4">
                {importResults.success ? (
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                <h3 className={`text-lg font-semibold ${
                  importResults.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {importResults.success ? 'Importación completada' : 'Error en la importación'}
                </h3>
              </div>
              
              <div className={`text-sm ${
                importResults.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {importResults.success ? (
                  <div className="space-y-2">
                    <p>✅ Se importaron {importResults.imported || 0} usuarios correctamente</p>
                    {importResults.skipped > 0 && (
                      <p>⚠️ Se omitieron {importResults.skipped} usuarios (ya existentes o con errores)</p>
                    )}
                    <p className="font-medium">Serás redirigido automáticamente en unos segundos...</p>
                  </div>
                ) : (
                  <div>
                    <p>{importResults.error}</p>
                    {importResults.details && (
                      <div className="mt-2 p-3 bg-red-100 rounded-lg">
                        <p className="font-medium">Detalles:</p>
                        <pre className="text-xs mt-1">{JSON.stringify(importResults.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserImport;