// ============================================================================
// 🎯 REACT HOOK CORREGIDO - useAppointmentForm.js
// ✅ SOLUCIÓN: Manejo mejorado de múltiples citas por doctor por día
// ============================================================================

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import apiClient from '../api/apiClient';

const appointmentSchema = z.object({
  patient: z.coerce.number().int().positive('Debe seleccionar un paciente'),
  doctor: z.coerce.number().int().positive('Debe seleccionar un doctor'),
  specialty: z.coerce.number().int().positive('Debe seleccionar una especialidad'),
  appointment_date: z.string().min(1, 'La fecha es obligatoria'),
  time_block: z.string().min(1, 'El bloque horario es obligatorio'),
  reason: z.string().min(5, 'Mínimo 5 caracteres').max(500, 'Máximo 500 caracteres'),
  status: z.string().optional(),
  payment_status: z.string().optional(),
});

export const useAppointmentForm = (appointment = null) => {
  const isEditing = !!appointment;
  
  // Estados locales
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [availableTimeBlocks, setAvailableTimeBlocks] = useState([]);
  const [loadingTimeBlocks, setLoadingTimeBlocks] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState(null); // ✅ NUEVO: Info de disponibilidad

  // Form hook
  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient: '',
      doctor: '',
      specialty: '',
      appointment_date: '',
      time_block: '',
      reason: '',
      status: 'SCHEDULED',
      payment_status: 'PROCESSING'
    }
  });

  const { setValue, watch, reset } = form;
  const selectedSpecialty = watch('specialty');
  const selectedDoctor = watch('doctor');
  const selectedDate = watch('appointment_date');

  // ✅ FUNCIÓN CORREGIDA: Obtener doctores por especialidad
  const fetchDoctorsBySpecialty = async (specialtyId) => {
    if (!specialtyId) return;
    
    setLoadingDoctors(true);
    try {
      console.log(`🔍 Obteniendo doctores para especialidad ${specialtyId}...`);
      
      const response = await apiClient.get('/api/appointments/api/doctors-by-specialty/', {
        params: { specialty_id: specialtyId }
      });
      
      console.log('✅ Respuesta de doctores:', response.data);
      
      let doctorsList = [];
      if (response.data && response.data.doctors && Array.isArray(response.data.doctors)) {
        doctorsList = response.data.doctors;
      } else if (Array.isArray(response.data)) {
        doctorsList = response.data;
      }
      
      const formattedDoctors = doctorsList.map(doctor => ({
        id: doctor.id,
        name: doctor.full_name || 
              (doctor.first_name && doctor.last_name ? `${doctor.first_name} ${doctor.last_name}` : null) ||
              doctor.name || 
              `Doctor #${doctor.id}`
      }));
      
      setDoctors(formattedDoctors);
      return formattedDoctors;
    } catch (error) {
      console.error('❌ Error al obtener doctores:', error);
      toast.error('Error al cargar los doctores disponibles');
      setDoctors([]);
      setValue('doctor', '');
      return [];
    } finally {
      setLoadingDoctors(false);
    }
  };

  // ✅ FUNCIÓN CORREGIDA: Obtener bloques horarios disponibles con información de cupos
  const fetchAvailableTimeBlocks = async (doctorId, date) => {
    if (!doctorId || !date) return;
    
    setLoadingTimeBlocks(true);
    setAvailabilityInfo(null); // Limpiar info anterior
    
    try {
      console.log(`🕐 Obteniendo bloques horarios para doctor ${doctorId} en fecha ${date}...`);
      
      // 🐛 DEBUG: Verificar cómo se está procesando la fecha
      console.log(`🔍 FECHA RECIBIDA:`, date);
      console.log(`🔍 TIPO DE FECHA:`, typeof date);
      
      // Calcular día de la semana CORRECTAMENTE
      const dateObj = new Date(date + 'T00:00:00'); // Evitar problemas de zona horaria
      const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay(); // Convertir domingo (0) a 7
      const dayNames = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      
      console.log(`📅 FECHA PROCESADA:`, {
        fechaOriginal: date,
        fechaObjeto: dateObj,
        diaNumero: dayOfWeek,
        diaNombre: dayNames[dayOfWeek],
        fechaISO: dateObj.toISOString(),
        fechaLocal: dateObj.toLocaleDateString()
      });
      
      // 🐛 DEBUG: Verificar parámetros que se envían a la API
      const params = {
        doctor_id: doctorId,
        date: date // Enviar fecha tal como viene del input
      };
      console.log(`📤 PARÁMETROS ENVIADOS A API:`, params);
      
      const response = await apiClient.get('/api/appointments/api/available-time-blocks/', {
        params: params
      });
      
      console.log('✅ Respuesta de bloques horarios:', response.data);
      
      let timeBlocks = [];
      let availabilityDetails = null;
      
      // ✅ PROCESAMIENTO MEJORADO: Manejar respuesta con información de cupos
      if (response.data && response.data.time_blocks && Array.isArray(response.data.time_blocks)) {
        timeBlocks = response.data.time_blocks
          .filter(block => !block.is_full) // ✅ Filtrar solo bloques disponibles
          .map(block => ({
            id: typeof block === 'object' ? block.id || block.time_block : block,
            name: typeof block === 'object' ? 
              (block.display_name || getTimeBlockDisplayName(block.id || block.time_block)) : 
              getTimeBlockDisplayName(block),
            // ✅ NUEVO: Información adicional de cupos
            max_patients: block.max_patients || null,
            available_slots: block.available_slots || null,
            occupied_slots: block.occupied_slots || null
          }));
        
        // ✅ NUEVO: Guardar información detallada de disponibilidad
        availabilityDetails = {
          doctor_id: response.data.doctor_id,
          date: response.data.date,
          day_name: dayNames[dayOfWeek],
          total_blocks: response.data.total_blocks || 0,
          available_blocks_count: response.data.available_blocks_count || timeBlocks.length,
          debug: response.data.debug
        };
        
        console.log(`✅ Encontrados ${timeBlocks.length} bloques horarios disponibles para ${dayNames[dayOfWeek]}`);
        
        // ✅ MEJORADO: Mostrar información más detallada
        if (timeBlocks.length > 0) {
          const totalSlots = timeBlocks.reduce((sum, block) => sum + (block.available_slots || 0), 0);
          toast.success(`📅 ${timeBlocks.length} horarios disponibles (${totalSlots} cupos en total)`);
        }
      } else {
        console.log('⚠️ Respuesta no contiene time_blocks válidos:', response.data);
        
        // 🐛 DEBUG: Mostrar el mensaje de error de Django si existe
        if (response.data?.message) {
          console.log(`📋 MENSAJE DE DJANGO: ${response.data.message}`);
        }
        
        availabilityDetails = {
          doctor_id: doctorId,
          date: date,
          day_name: dayNames[dayOfWeek],
          message: response.data?.message || 'Sin información disponible'
        };
      }
      
      // ✅ MANEJO MEJORADO: Mensajes más informativos según el caso
      if (timeBlocks.length === 0) {
        const message = response.data?.message || 'No se encontraron horarios específicos disponibles';
        console.log(`❌ ${message}`);
        
        if (response.data?.message?.includes('no tiene horarios definidos')) {
          toast.error(`El doctor no atiende los ${dayNames[dayOfWeek]}s. Seleccione otra fecha.`, {
            duration: 4000
          });
        } else if (response.data?.message?.includes('fechas pasadas')) {
          toast.error(`❌ Error de fecha: ${response.data.message}. Verifique la fecha seleccionada.`, {
            duration: 4000
          });
        } else if (response.data?.total_blocks > 0 && response.data?.available_blocks_count === 0) {
          toast.warning(`⚠️ Todos los horarios están ocupados para ${dayNames[dayOfWeek]} ${date}. Pruebe con otra fecha.`, {
            duration: 5000
          });
        } else {
          toast.error(`No hay horarios disponibles para ${dayNames[dayOfWeek]} ${date}. Pruebe con otra fecha.`, {
            duration: 4000
          });
        }
        
        // ✅ Dejar vacío si no hay disponibilidad
        setAvailableTimeBlocks([]);
        setAvailabilityInfo(availabilityDetails);
        return [];
      }
      
      setAvailableTimeBlocks(timeBlocks);
      setAvailabilityInfo(availabilityDetails);
      return timeBlocks;
    } catch (error) {
      console.error('❌ Error al obtener bloques horarios:', error);
      
      // 🐛 DEBUG: Mostrar detalles del error
      console.log('🔍 DETALLES DEL ERROR:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error || 'Error en los parámetros enviados';
        toast.error(`Error 400: ${errorMsg}`, { duration: 4000 });
      } else if (error.response?.status === 404) {
        toast.error('Endpoint no encontrado. Verifique la configuración del servidor.', { duration: 4000 });
      } else {
        toast.error('Error al cargar horarios. Verifique la fecha seleccionada.', { duration: 4000 });
      }
      
      // ✅ En caso de error, limpiar todo
      setAvailableTimeBlocks([]);
      setAvailabilityInfo(null);
      return [];
    } finally {
      setLoadingTimeBlocks(false);
    }
  };

  const getTimeBlockDisplayName = (blockId) => {
    const blockMap = {
      'MORNING': 'Mañana (8:00 - 12:00)',
      'AFTERNOON': 'Tarde (14:00 - 18:00)',
      'FULL_DAY': 'Día completo'
    };
    return blockMap[blockId] || blockId;
  };

  // ✅ FUNCIÓN NUEVA: Refrescar disponibilidad después de crear una cita
  const refreshAvailability = async () => {
    if (selectedDoctor && selectedDate) {
      await fetchAvailableTimeBlocks(selectedDoctor, selectedDate);
    }
  };

  // Effects
  useEffect(() => {
    if (isEditing && appointment) {
      reset();
      setValue('patient', appointment.patient);
      setValue('specialty', appointment.specialty);
      setValue('appointment_date', appointment.appointment_date);
      setValue('time_block', appointment.time_block);
      setValue('reason', appointment.reason);
      setValue('status', appointment.status || 'SCHEDULED');
      setValue('payment_status', appointment.payment_status || 'PROCESSING');
      
      if (appointment.specialty) {
        fetchDoctorsBySpecialty(appointment.specialty).then(() => {
          setValue('doctor', appointment.doctor);
        });
      }
      
      if (appointment.doctor && appointment.appointment_date) {
        fetchAvailableTimeBlocks(appointment.doctor, appointment.appointment_date);
      }
    } else {
      reset({
        patient: '',
        doctor: '',
        specialty: '',
        appointment_date: '',
        time_block: '',
        reason: '',
        status: 'SCHEDULED',
        payment_status: 'PROCESSING'
      });
      setDoctors([]);
      setAvailableTimeBlocks([]);
      setAvailabilityInfo(null);
    }
  }, [appointment, isEditing, reset, setValue]);

  useEffect(() => {
    if (selectedSpecialty) {
      fetchDoctorsBySpecialty(selectedSpecialty);
    } else {
      setDoctors([]);
      setValue('doctor', '');
    }
  }, [selectedSpecialty, setValue]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableTimeBlocks(selectedDoctor, selectedDate);
    } else {
      setAvailableTimeBlocks([]);
      setAvailabilityInfo(null);
      setValue('time_block', '');
    }
  }, [selectedDoctor, selectedDate, setValue]);

  return {
    form,
    doctors,
    loadingDoctors,
    availableTimeBlocks,
    loadingTimeBlocks,
    availabilityInfo, // ✅ NUEVO: Información detallada de disponibilidad
    refreshAvailability, // ✅ NUEVO: Función para refrescar disponibilidad
    isEditing,
    selectedSpecialty,
    selectedDoctor,
    selectedDate,
  };
};