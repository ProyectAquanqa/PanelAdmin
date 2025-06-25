import React, { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon, 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { 
  useGetSettings, 
  useUpdateSetting,
  useInitializeDefaultSettings
} from '../../hooks/useSettings';
import SettingsCategoryGroup from '../../components/settings/SettingsCategoryGroup';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const SettingsPage = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedSettings, setGroupedSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Obtener configuraciones
  const { 
    data, 
    isLoading: isLoadingSettings, 
    isError,
    error,
    refetch
  } = useGetSettings();
  
  // Actualizar configuración
  const updateSettingMutation = useUpdateSetting();
  
  // Inicializar configuraciones por defecto
  const initializeSettingsMutation = useInitializeDefaultSettings();
  
  // Agrupar configuraciones por categoría
  useEffect(() => {
    if (data?.results) {
      const settings = data.results;
      const grouped = {};
      
      settings.forEach(setting => {
        const category = setting.category || 'general';
        
        if (!grouped[category]) {
          grouped[category] = [];
        }
        
        grouped[category].push(setting);
      });
      
      setGroupedSettings(grouped);
      setIsLoading(false);
    }
  }, [data]);
  
  // Manejar actualización de configuración
  const handleUpdateSetting = async (id, data) => {
    try {
      await updateSettingMutation.mutateAsync({ id, data });
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
    }
  };
  
  // Manejar inicialización de configuraciones por defecto
  const handleInitializeSettings = async () => {
    if (window.confirm('¿Estás seguro de que deseas inicializar todas las configuraciones a sus valores por defecto? Esta acción no se puede deshacer.')) {
      try {
        await initializeSettingsMutation.mutateAsync();
        refetch();
      } catch (error) {
        console.error('Error al inicializar configuraciones:', error);
      }
    }
  };
  
  // Filtrar configuraciones por término de búsqueda
  const filteredSettings = {};
  if (searchTerm.trim()) {
    Object.keys(groupedSettings).forEach(category => {
      const filtered = groupedSettings[category].filter(setting => 
        setting.setting_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.setting_value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filtered.length > 0) {
        filteredSettings[category] = filtered;
      }
    });
  }
  
  const settingsToDisplay = searchTerm.trim() ? filteredSettings : groupedSettings;
  
  // Renderizar estado de carga
  if (isLoadingSettings || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-3"
        >
          <div className="w-12 h-12 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>
            Cargando configuraciones...
          </p>
        </motion.div>
      </div>
    );
  }
  
  // Renderizar error
  if (isError) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          theme === 'dark' 
            ? 'bg-red-900/20 border-red-500/20 text-red-400' 
            : 'bg-red-50 border-red-200 text-red-700'
        } border p-6 rounded-xl`}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Error al cargar las configuraciones</h3>
            <div className="mt-2 text-sm">
              <p>{error?.message || 'Ha ocurrido un error inesperado.'}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
        } shadow-sm border rounded-xl p-6`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            } flex items-center`}>
              <Cog6ToothIcon className="h-8 w-8 mr-2" />
              Configuraciones del Hospital
            </h1>
            <p className={`mt-1 text-sm ${
              theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
            }`}>
              Gestiona las configuraciones generales del sistema
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleInitializeSettings}
              disabled={initializeSettingsMutation.isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              {initializeSettingsMutation.isLoading ? 'Inicializando...' : 'Inicializar Valores por Defecto'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar configuraciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm ${
            theme === 'dark' 
              ? 'bg-neutral-800 border-neutral-700 text-white' 
              : 'border-gray-300'
          }`}
        />
      </div>

      {/* Configuraciones agrupadas por categoría */}
      <div className="space-y-6">
        {Object.keys(settingsToDisplay).length === 0 ? (
          <div className={`p-8 text-center rounded-lg border ${
            theme === 'dark' 
              ? 'bg-neutral-800 border-neutral-700 text-neutral-400' 
              : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}>
            {searchTerm.trim() ? (
              <>
                <p className="text-lg font-medium">No se encontraron configuraciones</p>
                <p className="mt-1">Intenta con otro término de búsqueda</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">No hay configuraciones disponibles</p>
                <p className="mt-1">Haz clic en "Inicializar Valores por Defecto" para comenzar</p>
              </>
            )}
          </div>
        ) : (
          Object.keys(settingsToDisplay).sort().map(category => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SettingsCategoryGroup
                title={category}
                settings={settingsToDisplay[category]}
                onUpdateSetting={handleUpdateSetting}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SettingsPage; 