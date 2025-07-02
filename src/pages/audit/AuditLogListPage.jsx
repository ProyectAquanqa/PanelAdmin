import React, { useState } from 'react';
import AuditLogTable from '../../components/audit/AuditLogTable';
import AuditLogDetail from '../../components/audit/AuditLogDetail';

const AuditLogListPage = () => {
  const [selectedAuditLogId, setSelectedAuditLogId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (auditLogId) => {
    setSelectedAuditLogId(auditLogId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Registros de Auditoría</h1>
          <p className="mt-2 text-sm text-gray-700">
            Listado de todas las acciones registradas en el sistema.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <AuditLogTable onViewDetails={handleViewDetails} />
      </div>
      
      <AuditLogDetail
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        auditLogId={selectedAuditLogId}
      />
    </div>
  );
};

export default AuditLogListPage; 