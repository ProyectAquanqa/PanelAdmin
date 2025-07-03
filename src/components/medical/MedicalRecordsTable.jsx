import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  EyeIcon, 
  PencilSquareIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';

const MedicalRecordsTable = ({ records, theme, onEdit, onView, onDelete }) => {
  if (!records || records.length === 0) {
    return (
      <div className={`p-8 text-center rounded-lg border ${
        theme === 'dark' 
          ? 'bg-neutral-800 border-neutral-700 text-neutral-400' 
          : 'bg-gray-50 border-gray-200 text-gray-500'
      }`}>
        <p className="text-lg font-medium">No se encontraron historiales médicos.</p>
        <p className="mt-1">Intenta ajustar los filtros de búsqueda o crea un nuevo historial.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: es });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Fecha inválida";
    }
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className={`min-w-full ${theme === 'dark' ? 'divide-neutral-700' : 'divide-gray-200'}`}>
        <thead className={`${theme === 'dark' ? 'bg-neutral-800' : 'bg-gray-50'}`}>
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo Principal</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnóstico</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className={`${theme === 'dark' ? 'bg-neutral-900 divide-neutral-700' : 'bg-white divide-gray-200'}`}>
          {records.map((record) => (
            <tr key={record.id} className={`${theme === 'dark' ? 'hover:bg-neutral-800' : 'hover:bg-gray-50'}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-400">#{record.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{formatDate(record.record_date)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">{record.patient?.user?.full_name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.doctor?.user?.full_name || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-gray-400 truncate" style={{ maxWidth: '200px' }}>{record.chief_complaint}</td>
              <td className="px-6 py-4 text-sm text-gray-400 truncate" style={{ maxWidth: '200px' }}>{record.diagnosis || 'No especificado'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-3">
                  <button onClick={() => onView(record)} className="text-blue-500 hover:text-blue-400">
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => onEdit(record)} className="text-yellow-500 hover:text-yellow-400">
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => onDelete(record)} className="text-red-500 hover:text-red-400">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MedicalRecordsTable; 