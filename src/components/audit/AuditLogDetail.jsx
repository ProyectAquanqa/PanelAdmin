import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useGetAuditLog } from '../../hooks/useAudit';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AuditLogDetail = ({ isOpen, onClose, auditLogId }) => {
  const { data: auditLog, isLoading, error } = useGetAuditLog(auditLogId, {
    enabled: !!auditLogId && isOpen
  });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Detalles del Registro de Auditoría
                </Dialog.Title>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
                    <p>Error al cargar los detalles del registro: {error.message}</p>
                  </div>
                ) : auditLog ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID</p>
                        <p className="mt-1 text-sm text-gray-900">{auditLog.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Acción</p>
                        <p className="mt-1 text-sm text-gray-900">{auditLog.action}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tipo de Entidad</p>
                        <p className="mt-1 text-sm text-gray-900">{auditLog.entity_type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID de Entidad</p>
                        <p className="mt-1 text-sm text-gray-900">{auditLog.entity_id || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Usuario</p>
                        <p className="mt-1 text-sm text-gray-900">{auditLog.user_id ? `#${auditLog.user_id}` : 'Sistema'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Fecha</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {auditLog.created_at ? format(new Date(auditLog.created_at), 'PPp', { locale: es }) : 'No disponible'}
                        </p>
                      </div>
                    </div>

                    {auditLog.details && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Detalles</p>
                        <div className="mt-1 bg-gray-50 p-3 rounded-md overflow-auto max-h-60">
                          <pre className="text-xs text-gray-900 whitespace-pre-wrap">
                            {typeof auditLog.details === 'string' 
                              ? auditLog.details 
                              : JSON.stringify(auditLog.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {auditLog.ip_address && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Dirección IP</p>
                        <p className="mt-1 text-sm text-gray-900">{auditLog.ip_address}</p>
                      </div>
                    )}

                    {auditLog.user_agent && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">User Agent</p>
                        <p className="mt-1 text-sm text-gray-900 truncate">{auditLog.user_agent}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">No se encontró información del registro de auditoría.</p>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AuditLogDetail; 