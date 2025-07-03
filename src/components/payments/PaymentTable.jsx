import React, { useState, useMemo } from 'react';
import { useGetPayments, useRefundPayment } from '../../hooks/usePayments';
import { useGetPaymentMethods } from '../../hooks/useCatalogs.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const PaymentStatusBadge = ({ status }) => {
  const statusConfig = {
    COMPLETED: {
      icon: <CheckCircleIcon className="w-5 h-5" />,
      className: 'bg-green-100 text-green-800',
      label: 'Completado',
    },
    PROCESSING: {
      icon: <ClockIcon className="w-5 h-5" />,
      className: 'bg-yellow-100 text-yellow-800',
      label: 'Procesando',
    },
    FAILED: {
      icon: <XCircleIcon className="w-5 h-5" />,
      className: 'bg-red-100 text-red-800',
      label: 'Fallido',
    },
    REFUNDED: {
      icon: <ArrowPathIcon className="w-5 h-5" />,
      className: 'bg-blue-100 text-blue-800',
      label: 'Reembolsado',
    },
    CANCELLED: {
      icon: <XCircleIcon className="w-5 h-5" />,
      className: 'bg-gray-100 text-gray-800',
      label: 'Cancelado',
    },
  };

  const config = statusConfig[status] || {
    icon: <CurrencyDollarIcon className="w-5 h-5" />,
    className: 'bg-gray-100 text-gray-800',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.icon}
      <span className="ml-1.5">{config.label}</span>
    </span>
  );
};

const PaymentTable = ({ onViewDetails }) => {
  const { theme } = useTheme();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');

  const { data, isLoading, isError, error } = useGetPayments({
    page,
    search: searchTerm,
    status,
    payment_method_id: paymentMethodId,
  });
  const { data: paymentMethodsData } = useGetPaymentMethods();
  const refundMutation = useRefundPayment({
    onSuccess: () => {
      toast.success('Pago reembolsado con éxito');
    },
    onError: (err) => {
      toast.error(err.message || 'Error al reembolsar el pago');
    },
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'search') {
      setSearchTerm(value);
    } else if (name === 'status') {
      setStatus(value);
    } else if (name === 'payment_method_id') {
      setPaymentMethodId(value);
    }
  };

  const handleRefund = (paymentId) => {
    if (window.confirm('¿Está seguro de que desea reembolsar este pago?')) {
      refundMutation.mutate(paymentId);
    }
  };

  const payments = useMemo(() => data?.pages.flatMap(page => page.results) || [], [data]);

  if (isLoading && !data) {
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

  return (
    <>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Buscar por paciente
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Nombre o Apellido"
              value={searchTerm}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="status"
            name="status"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={status}
            onChange={handleFilterChange}
          >
            <option value="">Todos</option>
            <option value="COMPLETED">Completado</option>
            <option value="PROCESSING">Procesando</option>
            <option value="FAILED">Fallido</option>
            <option value="REFUNDED">Reembolsado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="paymentMethod" className="sr-only">Método de Pago</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.target.value)}
          >
            <option value="">Todos los Métodos</option>
            {paymentMethodsData?.results.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>
      </div>
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
                  No hay pagos que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {payment.id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {payment.patient?.full_name || 'No disponible'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    S/ {payment.amount}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {payment.payment_method?.name || 'No especificado'}
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
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Ver
                    </button>
                    {payment.status === 'COMPLETED' && (
                      <button
                        onClick={() => handleRefund(payment.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={refundMutation.isLoading}
                      >
                        Reembolsar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PaymentTable; 