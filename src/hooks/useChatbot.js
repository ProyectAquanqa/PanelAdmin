import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getChatbotKnowledge, 
  getChatbotKnowledgeById, 
  createChatbotKnowledge, 
  updateChatbotKnowledge, 
  deleteChatbotKnowledge 
} from '../services/chatbotService';
import { toast } from 'react-hot-toast';

// Clave para la cache
const CHATBOT_QUERY_KEY = 'chatbot';

/**
 * Hook para obtener la lista de entradas del chatbot
 */
export const useGetChatbotKnowledge = (params = {}) => {
  return useQuery({
    queryKey: [CHATBOT_QUERY_KEY, params],
    queryFn: () => getChatbotKnowledge({
      page: params.page || 1,
      page_size: params.page_size || 10,
      search: params.search,
      ordering: params.ordering || '-created_at'
    }),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error al obtener entradas del chatbot:', error);
      toast.error(error.response?.data?.detail || 'Error al cargar la base de conocimientos');
    }
  });
};

/**
 * Hook para obtener una entrada específica
 */
export const useGetChatbotKnowledgeById = (id) => {
  return useQuery({
    queryKey: [CHATBOT_QUERY_KEY, id],
    queryFn: () => getChatbotKnowledgeById(id),
    enabled: !!id,
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error(`Error al obtener entrada ${id}:`, error);
      toast.error('Error al cargar la entrada');
    }
  });
};

/**
 * Hook para crear una nueva entrada
 */
export const useCreateChatbotKnowledge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => createChatbotKnowledge(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CHATBOT_QUERY_KEY] });
      toast.success('Entrada creada exitosamente');
      return data;
    },
    onError: (error) => {
      console.error('Error al crear entrada:', error);
      toast.error(error.response?.data?.detail || 'Error al crear la entrada');
      throw error;
    }
  });
};

/**
 * Hook para actualizar una entrada
 */
export const useUpdateChatbotKnowledge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => updateChatbotKnowledge(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [CHATBOT_QUERY_KEY] });
      if (variables.id) {
        queryClient.setQueryData([CHATBOT_QUERY_KEY, variables.id], data);
      }
      toast.success('Entrada actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error al actualizar entrada:', error);
      toast.error('Error al actualizar la entrada');
    }
  });
};

/**
 * Hook para eliminar una entrada
 */
export const useDeleteChatbotKnowledge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => deleteChatbotKnowledge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHATBOT_QUERY_KEY] });
      toast.success('Entrada eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error al eliminar entrada:', error);
      toast.error('Error al eliminar la entrada');
    }
  });
}; 