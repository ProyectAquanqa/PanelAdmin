import React, { useState } from 'react';
import { useGetMedicalRecords } from '../../hooks/useMedicalRecords';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import MedicalRecordsTable from '../../components/medical/MedicalRecordsTable';
import MedicalRecordFormModal from '../../components/medical/MedicalRecordFormModal';
import MedicalRecordDetailsModal from '../../components/medical/MedicalRecordDetailsModal';

// Placeholder for the main page
const MedicalRecordsPage = () => {
  const { theme } = useTheme();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para el modal de formulario (crear/editar)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRecordForForm, setSelectedRecordForForm] = useState(null);

  // Estado para el modal de detalles
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRecordForDetails, setSelectedRecordForDetails] = useState(null);

  const { data, isLoading, isError, error } = useGetMedicalRecords({
    page,
    search: searchTerm,
  });

  const records = data?.results || [];
  const totalRecords = data?.count || 0;

  // Handlers para el modal de formulario
  const handleOpenFormModal = (record = null) => {
    setSelectedRecordForForm(record);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedRecordForForm(null);
  };

  // Handlers para el modal de detalles
  const handleOpenDetailsModal = (record) => {
    setSelectedRecordForDetails(record);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRecordForDetails(null);
  };

  const handleDeleteRecord = (record) => {
    console.log('Deleting record:', record);
    // TODO: Implement delete logic
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-3"
        >
          <div className="w-12 h-12 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>
            Cargando Historiales Médicos...
          </p>
        </motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          theme === 'dark' 
            ? 'bg-red-900/20 border-red-500/20 text-red-400' 
            : 'bg-red-50 border-red-200 text-red-700'
        } border p-6 rounded-xl`}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Error al cargar los historiales</h3>
            <div className="mt-2 text-sm">
              <p>{error?.message || 'Ha ocurrido un error inesperado.'}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
        } shadow-sm border rounded-xl p-6`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            } flex items-center`}>
              <DocumentTextIcon className="h-8 w-8 text-primary-600 mr-3" />
              Historiales Médicos
            </h1>
            <p className={`mt-2 text-sm ${
              theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
            }`}>
              Gestiona los historiales médicos de los pacientes.
            </p>
          </div>
          <div className="mt-6 sm:mt-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenFormModal()}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Historial
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      <MedicalRecordsTable 
        records={records} 
        theme={theme}
        onView={handleOpenDetailsModal}
        onEdit={handleOpenFormModal}
        onDelete={handleDeleteRecord}
      />

      {/* Modal para Crear/Editar */}
      <MedicalRecordFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        theme={theme}
        record={selectedRecordForForm}
      />

      {/* Modal para ver Detalles */}
      <MedicalRecordDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        record={selectedRecordForDetails}
        theme={theme}
      />
    </div>
  );
};

export default MedicalRecordsPage; 