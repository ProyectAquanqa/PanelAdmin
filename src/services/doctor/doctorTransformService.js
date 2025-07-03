/**
 * Normaliza los datos de un doctor para asegurar consistencia
 * @param {Object} doctorData - Datos del doctor a normalizar
 * @returns {Object} Datos del doctor normalizados
 */
export const normalizeDoctorData = (doctorData) => {
  // Si no hay datos, devolver objeto con valores por defecto
  if (!doctorData) {
    return {
      id: null,
      first_name: '',
      last_name: '',
      full_name: '',
      specialties: [],
      is_active: false,
      is_primary: false,
      doctor_type: 'SPECIALIST',
      email: '',
      phone: '',
      license_number: '',
      consultation_room: ''
    };
  }
  
  // Copia para no modificar el original
  const normalizedDoctor = { 
    ...doctorData,
    // Asegurar campos básicos
    first_name: doctorData.first_name || '',
    last_name: doctorData.last_name || '',
    email: doctorData.email || '',
    phone: doctorData.phone || '',
    license_number: doctorData.license_number || '',
    consultation_room: doctorData.consultation_room || ''
  };
  
  // Normalizar especialidades
  normalizedDoctor.specialties = Array.isArray(normalizedDoctor.specialties) 
    ? normalizedDoctor.specialties.map(spec => {
        console.log('🔍 Normalizando especialidad:', spec);
        
        // Si es un número, convertirlo a objeto
        if (typeof spec === 'number') {
          return { 
            id: spec,
            name: `Especialidad ${spec}`,
            is_primary: false
          };
        }
        
        // Si es string que parece número, convertir
        if (typeof spec === 'string' && /^\d+$/.test(spec)) {
          const id = parseInt(spec, 10);
          return {
            id,
            name: `Especialidad ${id}`,
            is_primary: false
          };
        }
        
        // Si es un objeto, intentar extraer la información
        if (typeof spec === 'object' && spec !== null) {
          let id = null;
          let name = null;
          let isPrimary = false;
          
          // Intentar obtener el ID
          if (spec.id !== undefined) {
            id = typeof spec.id === 'string' ? parseInt(spec.id, 10) : spec.id;
          } else if (spec.specialty_id !== undefined) {
            id = typeof spec.specialty_id === 'string' ? parseInt(spec.specialty_id, 10) : spec.specialty_id;
          } else if (spec.specialty !== undefined) {
            if (typeof spec.specialty === 'object' && spec.specialty !== null) {
              id = typeof spec.specialty.id === 'string' ? parseInt(spec.specialty.id, 10) : spec.specialty.id;
              name = spec.specialty.name;
            } else {
              id = typeof spec.specialty === 'string' ? parseInt(spec.specialty, 10) : spec.specialty;
            }
          }
          
          // Intentar obtener el nombre
          if (!name) {
            name = spec.name || spec.specialty_name || 
                   (spec.specialty && spec.specialty.name) || 
                   (id ? `Especialidad ${id}` : null);
          }
          
          // Intentar obtener si es primaria
          isPrimary = spec.is_primary || 
                     (spec.specialty && spec.specialty.is_primary) || 
                     false;
          
          // Si tenemos un ID válido, retornar el objeto normalizado
          if (id !== null && !isNaN(id)) {
            console.log('✅ Especialidad normalizada:', { id, name, isPrimary });
            return {
              id,
              name: name || `Especialidad ${id}`,
              is_primary: isPrimary
            };
          }
        }
        
        // Si no pudimos extraer un ID válido, loguear y retornar null
        console.warn('❌ No se pudo normalizar especialidad:', spec);
        return null;
      }).filter(Boolean) // Eliminar nulls
    : [];
  
  // Verificar que no haya IDs duplicados
  const uniqueSpecialties = Array.from(
    new Map(normalizedDoctor.specialties.map(spec => [spec.id, spec]))
  ).map(([_, spec]) => spec);
  
  if (uniqueSpecialties.length !== normalizedDoctor.specialties.length) {
    console.warn('⚠️ Se encontraron especialidades duplicadas y fueron eliminadas');
    normalizedDoctor.specialties = uniqueSpecialties;
  }
  
  console.log('✅ Especialidades normalizadas:', normalizedDoctor.specialties);
  
  // Generar nombre completo
  normalizedDoctor.full_name = [
    normalizedDoctor.first_name,
    normalizedDoctor.last_name
  ].filter(Boolean).join(' ') || 'Doctor sin nombre';
  
  // Normalizar tipo de doctor
  normalizedDoctor.doctor_type = (doctorData.doctor_type || 'SPECIALIST').toUpperCase();
  normalizedDoctor.is_primary = Boolean(doctorData.is_primary);
  
  // Normalizar estado activo
  normalizedDoctor.is_active = Boolean(doctorData.is_active);
  
  // Registrar el resultado para depuración
  console.log('Doctor normalizado:', normalizedDoctor);
  
  return normalizedDoctor;
};

/**
 * Prepara los datos del doctor para enviar al servidor
 * @param {Object} doctorData - Datos del doctor a preparar
 * @returns {Object} Datos del doctor preparados para enviar
 */
export const prepareDoctorDataForSubmit = (doctorData) => {
  console.log('🔄 Preparando datos del doctor para enviar:', doctorData);
  
  // Copia para no modificar el original
  const preparedData = { ...doctorData };

  // IMPORTANTE: Asegurar que el DNI esté presente si existe
  if (doctorData.dni) {
    preparedData.dni = doctorData.dni;
  }

  // IMPORTANTE: Asegurar que email esté presente y sea válido
  if (!preparedData.email && preparedData.user?.email) {
    preparedData.email = preparedData.user.email;
  }
  
  // Verificar que el email exista y no esté vacío
  if (!preparedData.email || preparedData.email.trim() === '') {
    console.error('❌ Error: Email es requerido pero no está presente');
    throw new Error('Email es requerido');
  }
  
  // Formatear datos para la API de Django
  // Crear estructura de usuario si no existe
  if (!preparedData.user && preparedData.email) {
    preparedData.user = {
      email: preparedData.email,
      role: 'DOCTOR'
    };
    
    // Si hay contraseña, incluirla en el objeto user
    if (preparedData.password) {
      preparedData.user.password = preparedData.password;
    }
    
    // NO eliminar email del nivel principal por si el backend lo necesita ahí también
    // Algunos backends esperan email en ambos lugares
  }
  
  // Asegurar que las especialidades sean un array de IDs o un formato aceptado por la API
  if (preparedData.specialties) {
    // Intentar determinar el formato esperado por la API basado en localStorage
    const specialtiesFormat = localStorage.getItem('specialtiesFormat') || 'array';
    
    // Normalizar los IDs primero (siempre necesitamos los IDs limpios)
    const specialtyIds = preparedData.specialties.map(spec => {
      // Si es un objeto, extraer el ID
      if (typeof spec === 'object' && spec.id) {
        return spec.id;
      }
      // Si ya es un número, dejarlo como está
      if (typeof spec === 'number') {
        return spec;
      }
      // Si es una cadena que parece un número, convertirla
      if (typeof spec === 'string' && /^\d+$/.test(spec)) {
        return parseInt(spec, 10);
      }
      return null;
    }).filter(Boolean);
    
    // Aplicar el formato correcto según lo determinado anteriormente
    if (specialtiesFormat === 'objects') {
      // Formato de objetos: [{ specialty_id: 1 }, { specialty_id: 2 }]
      preparedData.specialties = specialtyIds.map(id => ({ specialty_id: id }));
      console.log('💡 Usando formato de objetos para especialidades');
    } else if (specialtiesFormat === 'specialty_objects') {
      // Formato de objetos con specialty: [{ specialty: 1 }, { specialty: 2 }]
      preparedData.specialties = specialtyIds.map(id => ({ specialty: id }));
      console.log('💡 Usando formato specialty para especialidades');
    } else {
      // Formato de array simple (predeterminado): [1, 2, 3]
      preparedData.specialties = specialtyIds;
      console.log('💡 Usando formato de array simple para especialidades');
    }
    
    // VERIFICACIÓN: Si no hay especialidades después de procesar, eso es un error
    if (preparedData.specialties.length === 0 && specialtyIds.length === 0) {
      console.error('❌ Error: Especialidades requeridas pero ninguna es válida');
    } else {
      console.log('✅ Especialidades procesadas:', preparedData.specialties);
    }
  }
  
  // Eliminar campos calculados o que no deben enviarse
  delete preparedData.full_name;
  delete preparedData.created_at;
  delete preparedData.updated_at;
  
  console.log('✅ Datos preparados para enviar:', preparedData);
  
  return preparedData;
};

/**
 * Función de depuración para analizar el formato de especialidades
 * @param {Array|Object} specialties - Especialidades a analizar
 * @returns {Object} Análisis detallado
 */
export const debugSpecialties = (specialties) => {
  console.log('🔍 Analizando especialidades:', specialties);
  
  const result = {
    type: typeof specialties,
    isArray: Array.isArray(specialties),
    length: Array.isArray(specialties) ? specialties.length : null,
    format: 'unknown',
    sample: null,
    details: []
  };
  
  if (!specialties) {
    result.format = 'null_or_undefined';
    return result;
  }
  
  if (Array.isArray(specialties)) {
    if (specialties.length === 0) {
      result.format = 'empty_array';
    } else {
      // Examinar el primer elemento para determinar el formato
      const sample = specialties[0];
      result.sample = sample;
      
      if (typeof sample === 'number') {
        result.format = 'array_of_ids';
      } else if (typeof sample === 'string') {
        result.format = 'array_of_string_ids';
      } else if (typeof sample === 'object') {
        if (sample.id && !sample.specialty && !sample.specialty_id) {
          result.format = 'array_of_objects_with_id';
        } else if (sample.specialty_id) {
          result.format = 'array_of_objects_with_specialty_id';
        } else if (sample.specialty) {
          if (typeof sample.specialty === 'object') {
            result.format = 'array_of_objects_with_specialty_object';
          } else {
            result.format = 'array_of_objects_with_specialty_id_property';
          }
        }
      }
      
      // Analizar cada elemento
      specialties.forEach((item, index) => {
        result.details.push({
          index,
          type: typeof item,
          value: item,
          properties: typeof item === 'object' ? Object.keys(item) : null
        });
      });
    }
  } else if (typeof specialties === 'object') {
    result.format = 'object_non_array';
    result.keys = Object.keys(specialties);
    
    // Intentar determinar si es un objeto con resultados anidados
    if (specialties.results && Array.isArray(specialties.results)) {
      result.format = 'object_with_results_array';
      result.resultsLength = specialties.results.length;
    }
  }
  
  console.log('📋 Análisis de especialidades:', result);
  return result;
}; 