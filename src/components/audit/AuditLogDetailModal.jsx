import React from 'react';

const JsonViewer = ({ data, title }) => {
  let parsedData;
  try {
    // Intenta parsear si es un string JSON, si no, lo usa directamente.
    parsedData = typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    // Si falla el parseo (ej. no es un JSON válido), muestra el string original.
    return (
      <div>
        <h4 className="font-semibold text-lg mb-2">{title}</h4>
        <pre className="p-2 bg-gray-100 rounded text-sm text-red-600">
          Error al parsear JSON: {String(data)}
        </pre>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-semibold text-lg mb-2">{title}</h4>
      <pre className="p-4 bg-gray-100 rounded text-sm overflow-auto max-h-64">
        {JSON.stringify(parsedData, null, 2)}
      </pre>
    </div>
  );
};

const AuditLogDetailModal = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Detalle de Auditoría</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
            <div className="bg-gray-50 p-3 rounded"><strong>Usuario:</strong> {log.username || 'Sistema'}</div>
            <div className="bg-gray-50 p-3 rounded"><strong>Operación:</strong> {log.operation_type}</div>
            <div className="bg-gray-50 p-3 rounded"><strong>Módulo:</strong> {log.module || 'N/A'}</div>
            <div className="bg-gray-50 p-3 rounded"><strong>Entidad:</strong> {log.entity_name} (ID: {log.entity_id})</div>
            <div className="bg-gray-50 p-3 rounded col-span-2"><strong>Descripción:</strong> {log.description}</div>
            <div className="bg-gray-50 p-3 rounded"><strong>Fecha:</strong> {new Date(log.created_at).toLocaleString()}</div>
            <div className="bg-gray-50 p-3 rounded"><strong>IP:</strong> {log.user_ip || 'N/A'}</div>
            <div className="bg-gray-50 p-3 rounded"><strong>Estado:</strong> {log.status ? 'Exitoso' : 'Fallido'}</div>
          </div>
          
          {log.error_message && (
            <div className="mb-6">
              <h3 className="font-semibold text-xl mb-2 text-red-600">Mensaje de Error</h3>
              <pre className="p-4 bg-red-50 text-red-700 rounded">{log.error_message}</pre>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {log.old_value && <JsonViewer data={log.old_value} title="Valor Anterior" />}
            {log.new_value && <JsonViewer data={log.new_value} title="Valor Nuevo" />}
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetailModal; 