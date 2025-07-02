import { z } from 'zod';

// Esquema de validación para el formulario de citas
export const appointmentSchema = z.object({
  patient: z.coerce.number().int().positive('Debe seleccionar un paciente'),
  doctor: z.coerce.number().int().positive('Debe seleccionar un doctor'),
  specialty: z.coerce.number().int().positive('Debe seleccionar una especialidad'),
  appointment_date: z.string().min(1, 'La fecha es obligatoria'),
  time_block: z.string().min(1, 'El bloque horario es obligatorio'),
  reason: z.string().min(5, 'Mínimo 5 caracteres').max(500, 'Máximo 500 caracteres'),
  status: z.string().optional(),
  payment_status: z.string().optional(),
}); 