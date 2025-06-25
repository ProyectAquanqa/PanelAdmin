import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useGetChatbotKnowledge, useDeleteChatbotKnowledge } from '../../hooks/useChatbot';
import ChatbotFormModal from '../../components/chatbot/ChatbotFormModal';
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

export default function ChatbotListPage() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentKnowledge, setCurrentKnowledge] = useState(null);
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
    error,
    isFetching
  } = useGetChatbotKnowledge({ 
    search: debouncedSearchTerm,
    page,
    page_size: pageSize,
    ordering: '-created_at'
  });

  useEffect(() => {
    if (!isLoading && !isFetching) {
      setIsSearching(false);
    }
  }, [isLoading, isFetching]);

  const deleteMutation = useDeleteChatbotKnowledge();

  const handleEdit = (knowledge) => {
    if (!knowledge) return;
    setCurrentKnowledge(knowledge);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentKnowledge(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!id || !window.confirm('¿Estás seguro de que deseas eliminar este conocimiento del chatbot?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Conocimiento eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(error.response?.data?.detail || 'Error al eliminar el conocimiento');
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsSearching(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    setIsSearching(true);
  };

  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    
    return tags.map((tag, index) => (
      <span key={index} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        theme === 'dark'
          ? 'bg-blue-900/20 text-blue-400 border border-blue-500/20'
          : 'bg-blue-100 text-blue-800 border border-blue-200'
      }`}>
        <TagIcon className="h-3 w-3 mr-1" />
        {tag}
      </span>
    ));
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
            Cargando conocimientos del chatbot...
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
            <h3 className="text-sm font-medium">Error al cargar los conocimientos</h3>
            <div className="mt-2 text-sm">
              <p>{error?.message || 'Ha ocurrido un error inesperado.'}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const knowledgeList = data?.results || [];
  const totalKnowledge = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalKnowledge / pageSize));

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
              <ChatBubbleLeftRightIcon className="h-8 w-8 mr-2" />
              Base de Conocimientos
            </h1>
            <p className={`mt-1 text-sm ${
              theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
            }`}>
              Gestiona las preguntas y respuestas del chatbot
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Conocimiento
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className={`h-5 w-5 ${
                theme === 'dark' ? 'text-neutral-400' : 'text-gray-400'
              }`} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Buscar por tema, pregunta o palabras clave..."
              className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-sm ${
                theme === 'dark'
                  ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Lista de conocimientos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence>
          {knowledgeList.map((knowledge) => (
            <motion.div
              key={knowledge.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${
                theme === 'dark'
                  ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700/50'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } border rounded-xl p-6 transition-colors duration-200`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {knowledge.topic}
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-start space-x-2">
                      <QuestionMarkCircleIcon className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                      }`} />
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-600'
                      }`}>
                        {knowledge.question}
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <DocumentTextIcon className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                      }`} />
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                      }`}>
                        {knowledge.answer.length > 100 
                          ? `${knowledge.answer.substring(0, 100)}...` 
                          : knowledge.answer}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {knowledge.keywords?.split(',').map((keyword, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          theme === 'dark'
                            ? 'bg-primary-900/20 text-primary-400 border border-primary-500/20'
                            : 'bg-primary-100 text-primary-800 border border-primary-200'
                        }`}
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(knowledge)}
                    className={`p-2 rounded-lg ${
                      theme === 'dark'
                        ? 'hover:bg-neutral-700 text-neutral-400 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(knowledge.id)}
                    className={`p-2 rounded-lg ${
                      theme === 'dark'
                        ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300'
                        : 'hover:bg-red-100 text-red-400 hover:text-red-500'
                    }`}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {!isLoading && !isError && knowledgeList.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center py-12 ${
            theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
          }`}
        >
          <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay conocimientos</h3>
          <p className="text-sm">
            {searchTerm
              ? 'No se encontraron resultados para tu búsqueda'
              : 'Comienza agregando nuevo conocimiento al chatbot'}
          </p>
        </motion.div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              theme === 'dark'
                ? 'bg-neutral-800 text-white hover:bg-neutral-700 disabled:bg-neutral-800 disabled:text-neutral-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
            } border ${
              theme === 'dark' ? 'border-neutral-700' : 'border-gray-300'
            }`}
          >
            Anterior
          </button>
          <span className={`px-4 py-2 text-sm ${
            theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
          }`}>
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              theme === 'dark'
                ? 'bg-neutral-800 text-white hover:bg-neutral-700 disabled:bg-neutral-800 disabled:text-neutral-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
            } border ${
              theme === 'dark' ? 'border-neutral-700' : 'border-gray-300'
            }`}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ChatbotFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setCurrentKnowledge(null);
          }}
          knowledge={currentKnowledge}
        />
      )}
    </div>
  );
} 