import React from 'react';

const getStatusBadge = (status) => {
  return status 
    ? <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Exitoso</span>
    : <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Fallido</span>;
};

const getOperationBadge = (operation) => {
  const styles = {
    CREATE: 'bg-blue-100 text-blue-800',
    UPDATE: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800',
    LOGIN: 'bg-green-100 text-green-800',
    LOGOUT: 'bg-gray-100 text-gray-800',
    SOFT_DELETE: 'bg-pink-100 text-pink-800',
  };
  const style = styles[operation] || 'bg-gray-200 text-gray-900';
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style}`}>{operation}</span>;
};

const AuditLogTable = ({ logs, onRowClick }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">No se encontraron registros de auditoría con los filtros actuales.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operación</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo / Entidad</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Ver</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.username || 'Sistema'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{getOperationBadge(log.operation_type)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="font-medium text-gray-900">{log.module || 'N/A'}</div>
                <div>{log.entity_name} (ID: {log.entity_id || 'N/A'})</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{log.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{getStatusBadge(log.status)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onRowClick(log)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Ver Detalles
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogTable; 