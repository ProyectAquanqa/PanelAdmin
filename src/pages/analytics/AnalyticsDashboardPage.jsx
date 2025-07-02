import React from 'react';
import AnalyticsSummary from '../../components/analytics/AnalyticsSummary';

const AnalyticsDashboardPage = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard Analítico</h1>
          <p className="mt-2 text-sm text-gray-700">
            Visualización de métricas clave y estadísticas del sistema.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <AnalyticsSummary />
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage; 