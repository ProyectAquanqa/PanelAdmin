# Mejoras en el Módulo de Especialidades Médicas

Este documento describe las mejoras implementadas para resolver los problemas de integración entre doctores y especialidades en el dashboard del hospital.

## Problemas Resueltos

1. **Error en DoctorSchedulePage.jsx**
   - Se corrigió el error "useUpdateMultipleAvailabilities is not provided" reemplazándolo con el nuevo hook `useManageAvailabilities`
   - Se actualizó la implementación para usar el método `updateMultiple` en lugar de `mutateAsync`

2. **Problemas de Referencia a Tabla de Especialidades**
   - Se creó un servicio especializado para especialidades médicas (`specialtyService.js`)
   - Se implementó un sistema robusto de detección automática de endpoints
   - Se agregó cache tanto en memoria como en localStorage para mejorar el rendimiento
   - Se normalizaron las respuestas para manejar diferentes formatos de API

3. **Integración entre Doctores y Especialidades**
   - Se implementó un nuevo servicio `doctorSpecialtyService.js` para manejar asignaciones
   - Se creó un hook personalizado `useDoctorSpecialties` para facilitar la integración
   - Se agregó soporte para múltiples formatos de API y manejo de errores

## Archivos Creados/Modificados

1. **Nuevos Servicios**
   - `src/services/medical/specialtyService.js`: Servicio especializado para especialidades médicas
   - `src/hooks/useMedicalSpecialties.js`: Hook para consumir el servicio de especialidades
   - `src/hooks/useDoctorSpecialties.js`: Hook para manejar especialidades de doctores

2. **Actualizaciones**
   - `src/pages/doctors/DoctorSchedulePage.jsx`: Corrección de importación y uso de hooks
   - `src/components/doctors/DoctorFormModal.jsx`: Uso de los nuevos hooks de especialidades
   - `src/services/specialtyService.js`: Mejoras en la detección de endpoints

## Mejoras en la Robustez

1. **Detección Automática de Endpoints**
   - Los servicios ahora prueban múltiples posibles rutas de API
   - Se almacena en localStorage la ruta exitosa para futuros usos
   - Se implementa un sistema de fallback cuando falla un endpoint

2. **Caché Mejorada**
   - Caché en memoria para reducir solicitudes a la API
   - Almacenamiento en localStorage para persistencia entre sesiones
   - Sistema de caducidad para asegurar datos frescos

3. **Normalización de Datos**
   - Conversión de diferentes formatos de respuesta a una estructura uniforme
   - Manejo de relaciones entre doctores y especialidades
   - Soporte para múltiples formatos de ID y referencias

## Uso

### Hook de Especialidades Médicas

```jsx
import useMedicalSpecialties from '../../hooks/useMedicalSpecialties';

function MiComponente() {
  const { specialties, isLoading, error } = useMedicalSpecialties();
  
  // Usar especialidades en el componente
}
```

### Hook de Especialidades de Doctor

```jsx
import useDoctorSpecialties from '../../hooks/useDoctorSpecialties';

function MiComponente({ doctorId }) {
  const { 
    specialties, 
    assignSpecialty,
    removeSpecialty,
    isPending
  } = useDoctorSpecialties(doctorId);
  
  // Usar en el componente
}
```

### Hook de Disponibilidad

```jsx
import { useManageAvailabilities } from '../../hooks/useAvailability';

function MiComponente({ doctorId }) {
  const { updateMultiple, isPending } = useManageAvailabilities();
  
  const guardarDisponibilidades = async (disponibilidades) => {
    await updateMultiple(doctorId, disponibilidades);
  };
  
  // Usar en el componente
}
``` 