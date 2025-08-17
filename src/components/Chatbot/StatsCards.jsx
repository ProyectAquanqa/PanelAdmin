import React from 'react';
import PropTypes from 'prop-types';
import { AcademicCapIcon, EyeIcon } from '@heroicons/react/24/outline';

/**
 * Componente para mostrar estadísticas del chatbot en tarjetas
 * Usa el color principal #2D728F según las directrices
 */

const renderIcon = (iconName) => {
  const iconProps = { className: "w-6 h-6" };
  switch (iconName) {
    case 'AcademicCapIcon':
      return <AcademicCapIcon {...iconProps} />;
    case 'EyeIcon':
      return <EyeIcon {...iconProps} />;
    default:
      return null;
  }
};

const StatsCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <p className="text-yellow-800">No se pudieron cargar las estadísticas del chatbot.</p>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Conversaciones',
      value: stats.total_conversations || 0,
      icon: 'AcademicCapIcon',
      color: 'bg-blue-500',
      change: stats.conversations_today ? `+${stats.conversations_today} hoy` : null,
    },
    {
      title: 'Base de Conocimiento',
      value: stats.total_knowledge_base || 0,
      icon: 'AcademicCapIcon',
      color: 'bg-green-500',
      change: null,
    },
    {
      title: 'Total de Vistas',
      value: stats.total_views || 0,
      icon: 'EyeIcon',
      color: 'bg-purple-500',
      change: null,
    },
    {
      title: 'Consultas de Hoy',
      value: stats.conversations_today || 0,
      icon: 'AcademicCapIcon',
      color: 'bg-[#2D728F]', // Color principal de la aplicación
      change: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white`}>
                {renderIcon(card.icon)}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                {card.change && (
                  <p className="text-xs text-green-600 font-medium">{card.change}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

StatsCards.propTypes = {
  stats: PropTypes.shape({
    total_conversations: PropTypes.number,
    total_knowledge_base: PropTypes.number,
    total_views: PropTypes.number,
    conversations_today: PropTypes.number,
  }),
  loading: PropTypes.bool.isRequired,
};

export default StatsCards; 