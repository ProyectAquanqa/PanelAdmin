import React, { useMemo } from 'react';

/**
 * Componente de gráfico de barras vertical para estadísticas del chatbot
 * Diseño profesional con barras verticales tradicionales
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

  // Gráfico de barras con las TOP 3 CATEGORÍAS reales del backend
  const categoryChartData = useMemo(() => {
    if (!realStats.topCategories || !Array.isArray(realStats.topCategories)) {
      return [];
    }
    
    const categories = realStats.topCategories.slice(0, 3); // Solo TOP 3
    if (categories.length === 0) {
      return [];
    }
    
    const maxCount = Math.max(...categories.map(cat => cat.count || 0));
    
    return categories.map(category => {
      // Manejar nombres de categoría correctamente
      let categoryName = 'Contenido sin clasificar';
      let hasRealCategory = false;
      
      if (category.category__name && category.category__name.trim()) {
        categoryName = category.category__name.trim();
        hasRealCategory = true;
      } else if (category.name && category.name.trim()) {
        categoryName = category.name.trim();
        hasRealCategory = true;
      } else {
        // Es realmente una entrada sin categoría asignada
        categoryName = 'Contenido sin clasificar';
        hasRealCategory = false;
      }
      
      return {
        name: categoryName,
        count: category.count || 0,
        percentage: maxCount > 0 ? ((category.count || 0) / maxCount) * 100 : 0,
        hasCategory: hasRealCategory,
        isUncategorized: !hasRealCategory
      };
    });
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
    <div className="space-y-4">
      {/* Stats compactos en grid responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {mainStats.map((stat, index) => (
          <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{stat.value.toLocaleString()}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
      
      {/* Gráfico de barras vertical */}
      {categoryChartData.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-soft">
          <div className="px-3 sm:px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <h4 className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">Top 3 Categorías Más Consultadas</h4>
          </div>
          <div className="p-3 sm:p-4">
            {/* Gráfico profesional con ejes mejorados */}
            <div className="">
              {/* Contenedor principal con grid */}
              <div className="grid grid-cols-[auto_1fr] gap-2">
                {/* Eje Y - Valores */}
                <div className="flex flex-col justify-between h-24 sm:h-28 pr-2 pt-6">
                  <span className="text-xs text-slate-500 dark:text-slate-400 text-right leading-none">
                    {Math.max(...categoryChartData.map(c => c.count))}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 text-right leading-none">
                    {Math.floor(Math.max(...categoryChartData.map(c => c.count)) / 2)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 text-right leading-none">
                    0
                  </span>
                </div>
                
                {/* Área del gráfico */}
                <div className="relative">
                  {/* Líneas de cuadrícula horizontales */}
                  <div className="absolute inset-0 flex flex-col justify-between pt-6">
                    <div className="w-full h-px bg-slate-200 dark:bg-slate-600"></div>
                    <div className="w-full h-px bg-slate-200 dark:bg-slate-600 opacity-50"></div>
                    <div className="w-full h-px bg-slate-300 dark:bg-slate-500"></div>
                  </div>
                  
                  {/* Contenedor de barras */}
                  <div className="relative h-24 sm:h-28 pt-6">
                    <div className="h-full flex items-end justify-around px-4">
                      {categoryChartData.map((category, index) => {
                        const colors = ['bg-slate-500', 'bg-slate-600', 'bg-slate-700'];
                        const isUncategorized = category.isUncategorized;
                        const barColor = isUncategorized ? 'bg-amber-500' : colors[index];
                        const maxValue = Math.max(...categoryChartData.map(c => c.count));
                        const barHeightPercentage = (category.count / maxValue) * 100;
                        
                        return (
                          <div key={index} className="flex flex-col items-center relative">
                            {/* Valor encima de la barra */}
                            <div className="absolute -top-5 text-xs font-medium text-slate-700 dark:text-slate-300">
                              {category.count}
                            </div>
                            
                            {/* Barra vertical */}
                            <div className="flex flex-col justify-end h-16 sm:h-18">
                              <div 
                                className={`w-8 sm:w-10 md:w-12 ${barColor} rounded-t transition-all duration-500 ease-out hover:opacity-90 cursor-pointer`}
                                style={{ height: `${Math.max(barHeightPercentage, 8)}%` }}
                                title={`${category.name}: ${category.count} consultas (${Math.round(category.percentage)}%)`}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Eje X - Categorías */}
              <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
                <div className="w-0"></div> {/* Espacio para alinear con las barras */}
                <div className="flex justify-around px-4">
                  {categoryChartData.map((category, index) => (
                    <div key={index} className="text-center max-w-16 sm:max-w-20">
                      <div className="text-xs font-medium text-slate-900 dark:text-white truncate" title={category.name}>
                        <span className="block sm:hidden">
                          {category.name.length > 6 ? `${category.name.substring(0, 6)}...` : category.name}
                        </span>
                        <span className="hidden sm:block">
                          {category.name.length > 12 ? `${category.name.substring(0, 12)}...` : category.name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {Math.round(category.percentage)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6 text-center">
          <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            {realStats.knowledgeBase > 0 ? 'Cargando datos...' : 'Sin datos disponibles'}
          </div>
        </div>
      )}
    </div>
  );
});

ChatbotStatsChart.displayName = 'ChatbotStatsChart';

export default ChatbotStatsChart;
