import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatients, getPatientById, createPatient, updatePatient, deletePatient } from '../services/patientService';
import { toast } from 'react-hot-toast';

// Clave para la cache de pacientes
const PATIENTS_QUERY_KEY = 'patients';

/**
 * Hook para obtener la lista de pacientes
 */
export const useGetPatients = (params = {}) => {
  return useQuery({
    queryKey: [PATIENTS_QUERY_KEY, params],
    queryFn: () => getPatients(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1, // Solo intentar una vez más si falla
    refetchOnWindowFocus: false, // No recargar al cambiar de pestaña
    onError: (error) => {
      console.error('Error al obtener pacientes:', error);
      toast.error('Error al cargar la lista de pacientes');
    }
  });
};

/**
 * Hook para obtener un paciente por su ID
 */
export const useGetPatientById = (id) => {
  return useQuery({
    queryKey: [PATIENTS_QUERY_KEY, id],
    queryFn: () => getPatientById(id),
    enabled: !!id, // Solo ejecutar si hay un ID
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error(`Error al obtener el paciente con ID ${id}:`, error);
      toast.error('Error al cargar los datos del paciente');
    }
  });
};

/**
 * Hook para crear un nuevo paciente
 */
export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => {
      console.log('Datos enviados para crear paciente:', data);
      
      // Asegurar que tenemos los campos obligatorios
      const requiredFields = ['first_name', 'last_name'];
      
      // Si no es paciente presencial, requerir email y password
      if (!data.is_presential) {
        requiredFields.push('email', 'password');
      }
      
      requiredFields.forEach(field => {
        if (!data[field]) {
          throw new Error(`El campo ${field} es obligatorio`);
        }
      });
      
      // Asegurar que document_type es un número
      if (typeof data.document_type === 'string') {
        data.document_type = parseInt(data.document_type) || 1;
      }
      
      // Asegurar que gender tiene un valor válido
      if (!data.gender) {
        data.gender = 'OTHER';
      } else {
        // Validar que gender sea uno de los valores permitidos
        const validGenders = ['MALE', 'FEMALE', 'OTHER'];
        if (!validGenders.includes(data.gender)) {
          console.warn('⚠️ Género inválido:', data.gender);
          // Intentar convertir formato corto a largo
          const shortToLong = {
            'M': 'MALE',
            'F': 'FEMALE',
            'O': 'OTHER'
          };
          if (shortToLong[data.gender]) {
            data.gender = shortToLong[data.gender];
            console.log('✅ Género convertido a:', data.gender);
          } else {
            data.gender = 'OTHER';
            console.warn('⚠️ Género inválido, usando OTHER por defecto');
          }
        }
      }
      
      // Asegurar que document_number tiene un valor
      if (!data.document_number) {
        data.document_number = '00000000';
      }
      
      // Asegurar que document_number tiene un valor
      if (!data.document_number) {
        data.document_number = '00000000';
      }
      
      // Validar blood_type
      if (data.blood_type) {
        const validBloodTypes = [
          'A_POSITIVE', 'A_NEGATIVE', 
          'B_POSITIVE', 'B_NEGATIVE', 
          'AB_POSITIVE', 'AB_NEGATIVE', 
          'O_POSITIVE', 'O_NEGATIVE'
        ];
        if (!validBloodTypes.includes(data.blood_type)) {
          console.warn('⚠️ Tipo de sangre inválido:', data.blood_type);
          // Intentar convertir formato corto a largo
          const shortToLong = {
            'A+': 'A_POSITIVE',
            'A-': 'A_NEGATIVE',
            'B+': 'B_POSITIVE',
            'B-': 'B_NEGATIVE',
            'AB+': 'AB_POSITIVE',
            'AB-': 'AB_NEGATIVE',
            'O+': 'O_POSITIVE',
            'O-': 'O_NEGATIVE',
          };
          if (shortToLong[data.blood_type]) {
            data.blood_type = shortToLong[data.blood_type];
            console.log('✅ Tipo de sangre convertido a:', data.blood_type);
          } else {
          delete data.blood_type;
          console.warn('⚠️ Tipo de sangre inválido eliminado en hook');
          }
        }
      }
      
      // Validar formato de teléfono
      if (data.phone) {
        if (!/^\+?1?\d{9,15}$/.test(data.phone)) {
          console.warn('⚠️ Formato de teléfono inválido');
          
          // Intentar limpiar el número
          const digitsOnly = data.phone.replace(/\D/g, '');
          if (digitsOnly.length >= 9 && digitsOnly.length <= 15) {
            data.phone = digitsOnly;
            console.log('✅ Teléfono corregido:', data.phone);
          } else {
            delete data.phone;
            console.warn('⚠️ Teléfono eliminado por formato inválido');
          }
        }
      }
      
      // Validar formato de teléfono de emergencia
      if (data.emergency_contact_phone) {
        if (!/^\+?1?\d{9,15}$/.test(data.emergency_contact_phone)) {
          console.warn('⚠️ Formato de teléfono de emergencia inválido');
          
          // Intentar limpiar el número
          const digitsOnly = data.emergency_contact_phone.replace(/\D/g, '');
          if (digitsOnly.length >= 9 && digitsOnly.length <= 15) {
            data.emergency_contact_phone = digitsOnly;
            console.log('✅ Teléfono de emergencia corregido:', data.emergency_contact_phone);
          } else {
            delete data.emergency_contact_phone;
            console.warn('⚠️ Teléfono de emergencia eliminado por formato inválido');
          }
        }
      }
      
      return createPatient(data);
    },
    onSuccess: (data) => {
      console.log('Paciente creado exitosamente:', data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error al crear paciente:', error);
      
      // Manejar específicamente errores de blood_type
      if (error.response?.data?.blood_type || 
          (error.response?.data?.detail && 
           typeof error.response.data.detail === 'string' && 
           error.response.data.detail.includes('blood_type'))) {
        console.error('Error específico de tipo de sangre detectado');
      }
      
      // Manejar específicamente errores de teléfono
      if (error.response?.data?.phone || 
          error.response?.data?.emergency_contact_phone ||
          (error.response?.data?.detail && 
           typeof error.response.data.detail === 'string' && 
           error.response.data.detail.includes('phone'))) {
        console.error('Error específico de teléfono detectado');
      }
      
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};

/**
 * Hook para actualizar un paciente
 */
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      console.log(`🔄 Hook useUpdatePatient: Actualizando paciente ${id} con datos:`, data);
      
      if (!id) {
        throw new Error('ID de paciente no proporcionado');
      }
      
      // Validar campos requeridos
      const requiredFields = ['first_name', 'last_name', 'document_number', 'birth_date', 'gender', 'phone'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }
      
      // Validar email y password solo si no es presencial
      if (!data.is_presential && !data.email) {
        throw new Error('El email es requerido para pacientes no presenciales');
      }
      
      // Asegurar que document_type es un número
      if (typeof data.document_type === 'string') {
        data.document_type = parseInt(data.document_type) || 1;
      }
      
      // Validar género
      const validGenders = ['MALE', 'FEMALE', 'OTHER'];
      if (!validGenders.includes(data.gender)) {
        const shortToLong = { 'M': 'MALE', 'F': 'FEMALE', 'O': 'OTHER' };
        data.gender = shortToLong[data.gender] || 'OTHER';
      }
      
      // Validar tipo de sangre si está presente
      if (data.blood_type) {
        const validBloodTypes = [
          'A_POSITIVE', 'A_NEGATIVE', 
          'B_POSITIVE', 'B_NEGATIVE', 
          'AB_POSITIVE', 'AB_NEGATIVE', 
          'O_POSITIVE', 'O_NEGATIVE'
        ];
        if (!validBloodTypes.includes(data.blood_type)) {
          const shortToLong = {
            'A+': 'A_POSITIVE', 'A-': 'A_NEGATIVE',
            'B+': 'B_POSITIVE', 'B-': 'B_NEGATIVE',
            'AB+': 'AB_POSITIVE', 'AB-': 'AB_NEGATIVE',
            'O+': 'O_POSITIVE', 'O-': 'O_NEGATIVE',
          };
          data.blood_type = shortToLong[data.blood_type] || undefined;
        }
      }
      
      // Validar teléfonos
      const validatePhone = (phone) => {
        if (!phone) return phone;
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length >= 9 && digitsOnly.length <= 15 ? digitsOnly : undefined;
      };
      
      data.phone = validatePhone(data.phone);
      if (data.emergency_contact_phone) {
        data.emergency_contact_phone = validatePhone(data.emergency_contact_phone);
      }
      
      // Limpiar campos vacíos o nulos
      const cleanData = { ...data };
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '' || cleanData[key] === null || cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });
      
      // Si es presencial, asegurar que no se envían credenciales
      if (cleanData.is_presential) {
        delete cleanData.email;
        delete cleanData.password;
      }
      
      try {
        console.log(`🔄 Llamando al servicio updatePatient con ID: ${id} y datos:`, cleanData);
        const result = await updatePatient(id, cleanData);
        console.log('✅ Resultado del servicio updatePatient:', result);
        return result;
      } catch (error) {
        console.error(`❌ Error en servicio updatePatient:`, error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('✅ Paciente actualizado exitosamente:', data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
      // Actualizar paciente específico en la cache
      if (variables.id) {
        queryClient.setQueryData([PATIENTS_QUERY_KEY, variables.id], data);
      }
    },
    onError: (error) => {
      console.error('❌ Error al actualizar paciente:', error);
      throw error; // Propagar el error para manejarlo en el componente
    },
  });
};

/**
 * Hook para eliminar un paciente
 */
export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log(`Eliminando paciente con ID: ${id}`);
      return deletePatient(id);
    },
    onSuccess: (_, id) => {
      console.log(`Paciente con ID ${id} eliminado exitosamente`);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error al eliminar paciente:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
}; 