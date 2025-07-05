import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';

const TableRow = ({ record, theme, onView, onEdit, onDelete, index }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'd MMM yyyy, h:mm a', { locale: es });
  };

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`${
        theme === 'dark' 
          ? 'hover:bg-neutral-800' 
          : 'hover:bg-gray-50'
      }`}
    >
      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
        <div className={`font-bold ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>{record.id}</div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-sm">
        <div className="font-semibold">{record.patient?.user.full_name || 'N/A'}</div>
        <div className="text-xs text-gray-500">{record.patient?.user.email || ''}</div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-sm">
        <div className="font-semibold">{record.doctor?.user.full_name || 'N/A'}</div>
        <div className="text-xs text-gray-500">{record.doctor?.specialties?.[0]?.name || 'Sin especialidad'}</div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-sm">
        {formatDate(record.record_date)}
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onView(record)}
            className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-neutral-700 text-blue-400' : 'hover:bg-gray-200 text-blue-600'}`}
            title="Ver Detalles"
          >
            <EyeIcon className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(record)}
            className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-neutral-700 text-yellow-400' : 'hover:bg-gray-200 text-yellow-600'}`}
            title="Editar"
          >
            <PencilIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
};

const MedicalRecordsTable = ({ records, theme, onView, onEdit, onDelete }) => {
  const tableHeaders = ['ID', 'Paciente', 'Doctor', 'Fecha de Registro', 'Acciones'];

  return (
    <div className={`shadow-sm border rounded-xl overflow-hidden ${
      theme === 'dark' 
        ? 'bg-neutral-900 border-neutral-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead className={`${theme === 'dark' ? 'bg-neutral-800' : 'bg-gray-50'}`}>
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
            {records.length > 0 ? (
              records.map((record, index) => (
                <TableRow 
                  key={record.id} 
                  record={record} 
                  theme={theme}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  index={index}
                />
              ))
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="text-center py-10">
                  <p className="text-gray-500">No se encontraron historiales médicos.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicalRecordsTable; 