import React, { useState, useEffect, useCallback } from 'react';
import useAudit from '../../hooks/useAudit';
import AuditLogTable from '../../components/audit/AuditLogTable';
import AuditLogFilters from '../../components/audit/AuditLogFilters';
import AuditLogDetailModal from '../../components/audit/AuditLogDetailModal';
import AuditTestGenerator from '../../components/audit/AuditTestGenerator';

const initialFilters = {
  search: '',
  created_at_gte: null,
  created_at_lte: null,
  operation_type: '',
  module: '',
  page: 1,
};

const AuditLogListPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const { auditLogs, pagination, isLoading, error, fetchAuditLogs } = useAudit();
  const [selectedLog, setSelectedLog] = useState(null);
  const [isTestGeneratorVisible, setIsTestGeneratorVisible] = useState(false);

  useEffect(() => {
    fetchAuditLogs(filters);
  }, [filters, fetchAuditLogs]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleRowClick = (log) => {
    setSelectedLog(log);
  };

  const handleCloseModal = () => {
    setSelectedLog(null);
  };

  const handleTestGenerated = () => {
    fetchAuditLogs(filters);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registros de Auditoría</h1>
      
      <div className="mb-4">
        <button
          onClick={() => setIsTestGeneratorVisible(!isTestGeneratorVisible)}
          className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold"
        >
          Herramienta de Prueba de Auditoría {isTestGeneratorVisible ? '▲' : '▼'}
        </button>
        {isTestGeneratorVisible && (
          <div className="mt-2">
            <AuditTestGenerator onTestGenerated={handleTestGenerated} />
          </div>
        )}
      </div>

      <AuditLogFilters 
        onFilterChange={handleFilterChange} 
        onReset={handleResetFilters}
        initialFilters={initialFilters}
      />
      
      {isLoading && <p>Cargando registros...</p>}
      {error && <p className="text-red-500">Error al cargar los registros: {error.message}</p>}
      
      {!isLoading && !error && (
        <>
          <AuditLogTable logs={auditLogs} onRowClick={handleRowClick} />
          {/* Aquí podrías agregar un componente de paginación si lo deseas */}
        </>
      )}

      {selectedLog && (
        <AuditLogDetailModal log={selectedLog} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default AuditLogListPage; 