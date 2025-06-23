import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useGetSpecialties, useDeleteSpecialty } from '../../hooks/useSpecialties';
import SpecialtyFormModal from '../../components/specialties/SpecialtyFormModal';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SpecialtyListPage() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    setPage(1);
    setIsSearching(true);
  }, [debouncedSearchTerm]);

  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useGetSpecialties({ 
    search: debouncedSearchTerm,
    page,
    page_size: pageSize 
  });

  useEffect(() => {
    if (!isLoading) {
      setIsSearching(false);
    }
  }, [isLoading]);

  const deleteSpecialty = useDeleteSpecialty();

  const handleEdit = (specialty) => {
    setCurrentSpecialty(specialty);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentSpecialty(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta especialidad?')) {
      try {
        await deleteSpecialty.mutateAsync(id);
        toast.success('Especialidad eliminada exitosamente');
      } catch (error) {
        toast.error('Error al eliminar la especialidad');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  };

  const calculateFinalPrice = (price, discount) => {
    return price * (1 - (discount / 100));
  };

  const renderDiscountBadge = (discount) => {
    if (discount <= 0) return null;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        theme === 'dark'
          ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20'
          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      }`}>
        <TagIcon className="h-3 w-3 mr-1" />
        {discount}% OFF
      </span>
    );
  };

  const renderDuration = (duration) => {
    return (
      <span className={`inline-flex items-center text-xs ${
        theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
      }`}>
        <ClockIcon className="h-3 w-3 mr-1" />
        {duration} min
      </span>
    );
  };

  if (isLoading && !isSearching) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-3"
        >
          <div className="w-12 h-12 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>
            Cargando especialidades...
          </p>
        </motion.div>
      </div>
    );
  }

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
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Error al cargar las especialidades</h3>
            <div className="mt-2 text-sm">
              <p>{error?.message || 'Ha ocurrido un error inesperado.'}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const specialties = data?.results || [];
  const totalSpecialties = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalSpecialties / pageSize));

  // Calcular estadísticas
  const averagePrice = specialties.length > 0 
    ? specialties.reduce((sum, s) => sum + Number(s.consultation_price || 0), 0) / specialties.length
    : 0;
  
  const specialtiesWithDiscount = specialties.filter(s => s.discount_percentage > 0).length;

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
              <AcademicCapIcon className="h-8 w-8 text-primary-600 mr-3" />
              Especialidades Médicas
            </h1>
            <p className={`mt-2 text-sm ${
              theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
            }`}>
              Administra las especialidades disponibles en el sistema
            </p>
            <div className={`mt-3 flex items-center space-x-4 text-sm ${
              theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
            }`}>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-1"></span>
                {totalSpecialties} especialidades
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-1"></span>
                {specialtiesWithDiscount} con descuento
              </span>
              <span className="flex items-center">
                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                Promedio: {formatPrice(averagePrice)}
              </span>
            </div>
          </div>
          <div className="mt-6 sm:mt-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nueva Especialidad
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Búsqueda */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
        } shadow-sm border rounded-xl p-6`}
      >
        <div className="flex-1 max-w-lg">
          <label htmlFor="search" className="sr-only">Buscar especialidades</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className={`h-5 w-5 ${
                theme === 'dark' ? 'text-neutral-400' : 'text-gray-400'
              }`} />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${
                theme === 'dark' 
                  ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <AnimatePresence>
            {(isLoading || isSearching) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-2 text-sm ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                } flex items-center`}
              >
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Buscando...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tabla */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
        } shadow-sm border rounded-xl overflow-hidden`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className={theme === 'dark' ? 'bg-neutral-900' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>Especialidad</th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>Descripción</th>
                <th scope="col" className={`px-6 py-4 text-center text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>Precio</th>
                <th scope="col" className={`px-6 py-4 text-center text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>Descuento</th>
                <th scope="col" className={`px-6 py-4 text-center text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>Precio Final</th>
                <th scope="col" className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              theme === 'dark' 
                ? 'bg-neutral-800 divide-neutral-700' 
                : 'bg-white divide-gray-200'
            }`}>
              {specialties.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <AcademicCapIcon className={`h-12 w-12 mb-4 ${
                        theme === 'dark' ? 'text-neutral-600' : 'text-gray-300'
                      }`} />
                      <h3 className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-900'
                      }`}>
                        {isSearching ? 'Buscando especialidades...' : 'No se encontraron especialidades'}
                      </h3>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                      }`}>
                        {!isSearching && !searchTerm && 'Comienza creando una nueva especialidad'}
                      </p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                specialties.map((specialty, index) => (
                  <motion.tr 
                    key={specialty.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`transition-colors ${
                      theme === 'dark' ? 'hover:bg-neutral-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-11 w-11">
                          <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${
                            theme === 'dark' 
                              ? 'bg-primary-900/20 border border-primary-500/20' 
                              : 'bg-primary-50 border border-primary-200'
                          }`}>
                            <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {specialty.name}
                          </div>
                          {specialty.average_duration && (
                            <div className="mt-1">
                              {renderDuration(specialty.average_duration)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm max-w-md ${
                        theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                      }`}>
                        {specialty.description || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`text-sm font-medium flex items-center justify-center ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                     
                        {formatPrice(specialty.consultation_price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {specialty.discount_percentage > 0 ? (
                          renderDiscountBadge(specialty.discount_percentage)
                        ) : (
                          <span className={`text-sm ${
                            theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
                          }`}>
                            Sin descuento
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className={`text-sm font-semibold ${
                          specialty.discount_percentage > 0 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatPrice(calculateFinalPrice(specialty.consultation_price, specialty.discount_percentage))}
                        </div>
                        {specialty.discount_percentage > 0 && (
                          <div className={`text-xs line-through ${
                            theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
                          }`}>
                            {formatPrice(specialty.consultation_price)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(specialty)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' 
                              ? 'text-primary-400 hover:text-primary-300 hover:bg-primary-900/20' 
                              : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'
                          }`}
                          title="Editar especialidad"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(specialty.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' 
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                              : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                          }`}
                          title="Eliminar especialidad"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <SpecialtyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        specialty={currentSpecialty}
      />
    </div>
  );
}