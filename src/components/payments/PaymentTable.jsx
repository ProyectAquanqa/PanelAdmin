import React, { useState } from 'react';
import { useGetPayments } from '../../hooks/usePayments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  ArrowPathIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const PaymentStatusBadge = ({ status }) => {
  const statusConfig = {
    COMPLETED: {
      icon: <CheckCircleIcon className="w-5 h-5" />,
      className: 'bg-green-100 text-green-800',
      label: 'Completado'
    },
    PROCESSING: {
      icon: <ClockIcon className="w-5 h-5" />,
      className: 'bg-yellow-100 text-yellow-800',
      label: 'Procesando'
    },
    FAILED: {
      icon: <XCircleIcon className="w-5 h-5" />,
      className: 'bg-red-100 text-red-800',
      label: 'Fallido'
    },
    REFUNDED: {
      icon: <ArrowPathIcon className="w-5 h-5" />,
      className: 'bg-blue-100 text-blue-800',
      label: 'Reembolsado'
    },
    CANCELLED: {
      icon: <XCircleIcon className="w-5 h-5" />,
      className: 'bg-gray-100 text-gray-800',
      label: 'Cancelado'
    }
  };

  const config = statusConfig[status] || {
    icon: <CurrencyDollarIcon className="w-5 h-5" />,
    className: 'bg-gray-100 text-gray-800',
    label: status
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${config.className}`}>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </span>
  );
};

const PaymentTable = ({ onViewDetails }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = useGetPayments({ page: currentPage });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
        <p>Error al cargar los pagos: {error.message}</p>
      </div>
    );
  }

  const payments = data?.results || [];
  const totalPages = Math.ceil((data?.count || 0) / 10);

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Paciente</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Monto</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Método</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha</th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {payments.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-8 text-center text-gray-500">
                No hay pagos disponibles
              </td>
            </tr>
          ) : (
            payments.map((payment) => (
              <tr key={payment.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {payment.id}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {payment.patient_name || 'No disponible'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  S/ {payment.amount.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {payment.payment_method || 'No especificado'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <PaymentStatusBadge status={payment.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {payment.created_at ? format(new Date(payment.created_at), 'PPp', { locale: es }) : 'No disponible'}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button
                    onClick={() => onViewDetails(payment.id)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                currentPage === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                currentPage === totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> a{' '}
                <span className="font-medium">{Math.min(currentPage * 10, data?.count || 0)}</span> de{' '}
                <span className="font-medium">{data?.count || 0}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                    currentPage === 1
                      ? 'bg-white text-gray-300'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(Math.min(5, totalPages)).keys()].map((page) => (
                  <button
                    key={page + 1}
                    onClick={() => setCurrentPage(page + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === page + 1
                        ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                        : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                    currentPage === totalPages
                      ? 'bg-white text-gray-300'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTable; 