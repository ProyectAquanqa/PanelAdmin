import React, { useMemo } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

/**
 * Componente de gráfico específico para estadísticas del chatbot
 * Muestra datos REALES del backend de estadísticas del chatbot
 */
const ChatbotStatsChart = React.memo(({ chatbotData = {}, loading = false }) => {
  
  // Datos reales del backend (sin fallbacks ni simulaciones)
  const realStats = useMemo(() => {
    return {
      totalConversations: chatbotData.total_conversations || 0,
      knowledgeBase: chatbotData.total_knowledge_base || 0,
      totalViews: chatbotData.total_views || 0,
      conversationsToday: chatbotData.conversations_today || 0,
      topCategories: chatbotData.top_categories || []
    };
  }, [chatbotData]);

  // Gráfico de barras con las TOP CATEGORÍAS reales del backend
  const categoryChartData = useMemo(() => {
    if (!realStats.topCategories || !Array.isArray(realStats.topCategories)) {
      return [];
    }
    
    const categories = realStats.topCategories.slice(0, 5); // Máximo 5 categorías
    if (categories.length === 0) {
      return [];
    }
    
    const maxCount = Math.max(...categories.map(cat => cat.count || 0));
    
    return categories.map(category => ({
      name: category.category__name || category.name || 'Sin categoría',
      count: category.count || 0,
      percentage: maxCount > 0 ? ((category.count || 0) / maxCount) * 100 : 0
    }));
  }, [realStats.topCategories]);

  // Estadísticas principales - solo las que funcionan
  const mainStats = useMemo(() => [
    {
      label: 'Total Conversaciones',
      value: realStats.totalConversations,
      color: 'bg-blue-500'
    },
    {
      label: 'Base Conocimiento', 
      value: realStats.knowledgeBase,
      color: 'bg-emerald-500'
    }
  ], [realStats]);
  
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-750 rounded-lg animate-pulse">
        <div className="text-center">
          <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-32 mb-4 mx-auto"></div>
          <div className="flex items-end space-x-2 h-32">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 space-y-1">
                <div className={`bg-slate-300 dark:bg-slate-600 rounded w-full`} style={{ height: `${Math.random() * 80 + 20}px` }}></div>
                <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-64 space-y-3">
      {/* Header compacto 13px */}
      <div className="grid grid-cols-2 gap-2">
        {mainStats.map((stat, index) => (
          <div key={index} className="text-center p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-base font-semibold text-slate-900 dark:text-white">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>
      
      {/* Gráfico profesional de TOP CATEGORÍAS */}
      {categoryChartData.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Top Categorías Consultadas
            </h4>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {categoryChartData.map((category, index) => (
                <div key={index} className="flex items-center space-x-3 group hover:bg-slate-50 dark:hover:bg-slate-700/20 rounded-lg p-2 transition-all duration-200">
                  <div className="flex-shrink-0 w-6 text-center">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={category.name}>
                        {category.name}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full ml-2">
                        {category.count}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-emerald-500' :
                            index === 2 ? 'bg-purple-500' :
                            index === 3 ? 'bg-amber-500' : 
                            'bg-slate-400'
                          }`}
                          style={{ 
                            width: `${Math.max(category.percentage, 10)}%`,
                            minWidth: '10px'
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium min-w-[35px] text-right">
                        {Math.round(category.percentage)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center h-24">
          <div className="text-center">
            <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-1">
              <div className="w-3 h-3 border-2 border-slate-400 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {realStats.knowledgeBase > 0 ? 'Cargando...' : 'Sin datos'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

ChatbotStatsChart.displayName = 'ChatbotStatsChart';

export default ChatbotStatsChart;
