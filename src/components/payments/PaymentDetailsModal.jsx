import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useGetPayment, useRefundPayment } from '../../hooks/usePayments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PaymentDetailsModal = ({ isOpen, onClose, paymentId }) => {
  const { data: payment, isLoading, error } = useGetPayment(paymentId, {
    enabled: !!paymentId && isOpen
  });
  
  const refundMutation = useRefundPayment({
    onSuccess: () => {
      onClose();
    }
  });

  const handleRefund = () => {
    if (window.confirm('¿Está seguro que desea reembolsar este pago?')) {
      refundMutation.mutate(paymentId);
    }
  };

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
                  Detalles del Pago
                </Dialog.Title>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
                    <p>Error al cargar los detalles del pago: {error.message}</p>
                  </div>
                ) : payment ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID</p>
                        <p className="mt-1 text-sm text-gray-900">{payment.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Estado</p>
                        <p className="mt-1 text-sm text-gray-900">{payment.status}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Monto</p>
                        <p className="mt-1 text-sm text-gray-900">S/ {payment.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Método de Pago</p>
                        <p className="mt-1 text-sm text-gray-900">{payment.payment_method || 'No especificado'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {payment.created_at ? format(new Date(payment.created_at), 'PPp', { locale: es }) : 'No disponible'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Fecha de Actualización</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {payment.updated_at ? format(new Date(payment.updated_at), 'PPp', { locale: es }) : 'No disponible'}
                        </p>
                      </div>
                    </div>

                    {payment.appointment_id && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID de Cita</p>
                        <p className="mt-1 text-sm text-gray-900">{payment.appointment_id}</p>
                      </div>
                    )}

                    {payment.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Notas</p>
                        <p className="mt-1 text-sm text-gray-900">{payment.notes}</p>
                      </div>
                    )}

                    {payment.reference && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Referencia</p>
                        <p className="mt-1 text-sm text-gray-900">{payment.reference}</p>
                      </div>
                    )}

                    {payment.status === 'COMPLETED' && (
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={handleRefund}
                          disabled={refundMutation.isLoading}
                          className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        >
                          {refundMutation.isLoading ? 'Procesando...' : 'Reembolsar Pago'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">No se encontró información del pago.</p>
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

export default PaymentDetailsModal; 