import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateChatbotKnowledge, useUpdateChatbotKnowledge } from '../../hooks/useChatbot';
import { toast } from 'react-hot-toast';

// Esquema de validación
const chatbotSchema = z.object({
  topic: z.string().min(3, 'El tema debe tener al menos 3 caracteres'),
  question: z.string().min(5, 'La pregunta debe tener al menos 5 caracteres'),
  answer: z.string().min(10, 'La respuesta debe tener al menos 10 caracteres'),
  keywords: z.string().min(3, 'Las palabras clave son requeridas'),
  category: z.string().optional().nullable(),
  subcategory: z.string().optional().nullable(),
  priority: z.number().min(1).max(10).default(5),
  is_active: z.boolean().default(true),
  data_type: z.enum(['STRING', 'INTEGER', 'BOOLEAN', 'JSON']).default('STRING')
});

const ChatbotFormModal = ({ isOpen, onClose, knowledge = null }) => {
  const isEditing = !!knowledge;
  
  const createKnowledge = useCreateChatbotKnowledge();
  const updateKnowledge = useUpdateChatbotKnowledge();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset
  } = useForm({
    resolver: zodResolver(chatbotSchema),
    defaultValues: {
      topic: knowledge?.topic || '',
      question: knowledge?.question || '',
      answer: knowledge?.answer || '',
      keywords: knowledge?.keywords || '',
      category: knowledge?.category || '',
      subcategory: knowledge?.subcategory || '',
      priority: knowledge?.priority || 5,
      is_active: knowledge?.is_active ?? true,
      data_type: knowledge?.data_type || 'STRING'
    }
  });

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateKnowledge.mutateAsync({ id: knowledge.id, data });
        toast.success('Conocimiento actualizado exitosamente');
      } else {
        await createKnowledge.mutateAsync(data);
        toast.success('Conocimiento creado exitosamente');
      }
      reset();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.detail || 'Error al guardar el conocimiento');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                >
                  <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2 text-primary-600" />
                  {isEditing ? 'Editar Conocimiento' : 'Nuevo Conocimiento'}
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tema
                    </label>
                    <input
                      type="text"
                      {...register('topic')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                    {errors.topic && (
                      <p className="mt-1 text-sm text-red-600">{errors.topic.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Pregunta
                    </label>
                    <input
                      type="text"
                      {...register('question')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                    {errors.question && (
                      <p className="mt-1 text-sm text-red-600">{errors.question.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Respuesta
                    </label>
                    <textarea
                      {...register('answer')}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                    {errors.answer && (
                      <p className="mt-1 text-sm text-red-600">{errors.answer.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Palabras clave
                    </label>
                    <input
                      type="text"
                      {...register('keywords')}
                      placeholder="Separadas por comas"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                    {errors.keywords && (
                      <p className="mt-1 text-sm text-red-600">{errors.keywords.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Categoría
                      </label>
                      <input
                        type="text"
                        {...register('category')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Prioridad
                      </label>
                      <select
                        {...register('priority', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <option key={num} value={num}>
                            {num} - {num === 1 ? 'Alta' : num === 10 ? 'Baja' : `Prioridad ${num}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('is_active')}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Activo
                    </label>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ChatbotFormModal;