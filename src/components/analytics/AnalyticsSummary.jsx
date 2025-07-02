import React from 'react';
import { useGetAnalyticsSummary } from '../../hooks/useAnalytics';
import {
  CurrencyDollarIcon,
  UsersIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon, description, isLoading, color }) => {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg border ${color ? `border-${color}-300` : 'border-gray-300'}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color ? `bg-${color}-100` : 'bg-gray-100'}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                {isLoading ? (
                  <div className="animate-pulse h-5 w-20 bg-gray-200 rounded"></div>
                ) : (
                  <div className="text-lg font-medium text-gray-900">{value}</div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {description && (
        <div className={`bg-gray-50 px-5 py-3 ${color ? `border-t border-${color}-300` : 'border-t border-gray-300'}`}>
          <div className="text-sm">
            <span className="text-gray-500">{description}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyticsSummary = () => {
  const { data, isLoading, error } = useGetAnalyticsSummary();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
        <p>Error al cargar el resumen analítico: {error.message}</p>
      </div>
    );
  }

  const financialOverview = data?.financial_overview || {};
  const patientDemographics = data?.patient_demographics || {};
  const appointmentStats = data?.appointment_stats || {};

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen Analítico</h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Ingresos Totales */}
        <StatCard
          title="Ingresos Totales"
          value={isLoading ? '' : `S/ ${financialOverview.total_revenue?.toLocaleString() || '0'}`}
          icon={<CurrencyDollarIcon className="h-6 w-6 text-green-600" />}
          description="Total de ingresos registrados"
          isLoading={isLoading}
          color="green"
        />
        
        {/* Total de Pacientes */}
        <StatCard
          title="Total de Pacientes"
          value={isLoading ? '' : data?.total_patients?.toLocaleString() || '0'}
          icon={<UsersIcon className="h-6 w-6 text-blue-600" />}
          description="Pacientes registrados en el sistema"
          isLoading={isLoading}
          color="blue"
        />
        
        {/* Total de Citas */}
        <StatCard
          title="Total de Citas"
          value={isLoading ? '' : appointmentStats.total_appointments?.toLocaleString() || '0'}
          icon={<CalendarIcon className="h-6 w-6 text-purple-600" />}
          description="Citas registradas en el sistema"
          isLoading={isLoading}
          color="purple"
        />
        
        {/* Tasa de No Show */}
        <StatCard
          title="Tasa de No Show"
          value={isLoading ? '' : `${(appointmentStats.no_show_rate_last_30_days * 100).toFixed(1)}%` || '0%'}
          icon={<ChartBarIcon className="h-6 w-6 text-yellow-600" />}
          description="Últimos 30 días"
          isLoading={isLoading}
          color="yellow"
        />
      </div>
      
      {/* Sección de Detalles Adicionales */}
      {!isLoading && data && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Demografía de Pacientes</h3>
              <div className="mt-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Edad Promedio</dt>
                    <dd className="mt-1 text-sm text-gray-900">{patientDemographics.avg_age?.toFixed(1) || 'No disponible'} años</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Distribución por Género</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {patientDemographics.by_gender ? (
                        <ul>
                          {Object.entries(patientDemographics.by_gender).map(([gender, count]) => (
                            <li key={gender}>{gender}: {count}</li>
                          ))}
                        </ul>
                      ) : (
                        'No disponible'
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Resumen Financiero</h3>
              <div className="mt-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Ingreso Promedio por Paciente</dt>
                    <dd className="mt-1 text-sm text-gray-900">S/ {financialOverview.avg_revenue_per_patient?.toFixed(2) || '0'}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Total de Transacciones</dt>
                    <dd className="mt-1 text-sm text-gray-900">{financialOverview.total_transactions?.toLocaleString() || '0'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSummary; 