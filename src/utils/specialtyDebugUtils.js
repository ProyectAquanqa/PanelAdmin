// specialtyDebugUtils.js - Herramientas para diagnosticar problemas con especialidades

/**
 * Función para diagnosticar problemas comunes del módulo de especialidades
 * Ejecuta en la consola del navegador: await diagnoseSpecialtyIssues()
 */
export const diagnoseSpecialtyIssues = async () => {
  console.log('🔍 INICIANDO DIAGNÓSTICO DE ESPECIALIDADES');
  console.log('=' .repeat(50));
  
  const issues = [];
  const checks = [];
  
  // 1. Verificar conectividad básica
  console.log('📡 Verificando conectividad...');
  try {
    const response = await fetch('/api/');
    if (response.ok) {
      checks.push('✅ Conexión al backend: OK');
    } else {
      checks.push(`❌ Conexión al backend: Error ${response.status}`);
      issues.push('Backend no responde correctamente');
    }
  } catch (error) {
    checks.push('❌ Conexión al backend: Sin conexión');
    issues.push('No se puede conectar al backend');
  }
  
  // 2. Verificar autenticación
  console.log('🔐 Verificando autenticación...');
  const token = localStorage.getItem('authToken');
  if (token) {
    checks.push('✅ Token de autenticación: Presente');
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        checks.push('⚠️ Token: Expirado');
        issues.push('Token de autenticación expirado');
      } else {
        checks.push('✅ Token: Válido');
      }
    } catch (e) {
      checks.push('❌ Token: Inválido');
      issues.push('Token de autenticación malformado');
    }
  } else {
    checks.push('❌ Token de autenticación: No encontrado');
    issues.push('No hay token de autenticación');
  }
  
  // 3. Probar endpoints de especialidades
  console.log('🏥 Probando endpoints de especialidades...');
  const endpointsToTest = [
    '/api/catalogs/specialties/',
    '/api/catalogs/specialties',
    '/api/catalog/specialties/',
    '/api/v1/catalogs/specialties/',
  ];
  
  let workingEndpoint = null;
  for (const endpoint of endpointsToTest) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        workingEndpoint = endpoint;
        checks.push(`✅ Endpoint funcional: ${endpoint}`);
        break;
      } else if (response.status === 404) {
        checks.push(`❌ Endpoint no encontrado: ${endpoint}`);
      } else {
        checks.push(`⚠️ Endpoint con problemas: ${endpoint} (${response.status})`);
      }
    } catch (error) {
      checks.push(`❌ Error al probar: ${endpoint}`);
    }
  }
  
  if (!workingEndpoint) {
    issues.push('Ningún endpoint de especialidades está funcionando');
  }
  
  // 4. Verificar estructura de la aplicación
  console.log('📁 Verificando estructura de la aplicación...');
  
  // Verificar si React Query está configurado
  if (window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__) {
    checks.push('✅ React Query: Configurado');
  } else {
    checks.push('⚠️ React Query: No detectado');
  }
  
  // Verificar si Tailwind está cargado
  const hasToastContainer = document.querySelector('[data-testid="react-hot-toast"]') || 
                           document.querySelector('.react-hot-toast');
  if (hasToastContainer) {
    checks.push('✅ React Hot Toast: Configurado');
  } else {
    checks.push('⚠️ React Hot Toast: No detectado');
  }
  
  // 5. Verificar datos de prueba
  if (workingEndpoint) {
    console.log('📊 Verificando datos...');
    try {
      const response = await fetch(workingEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const specialties = Array.isArray(data) ? data : data.results || data.data || [];
        
        if (specialties.length === 0) {
          checks.push('⚠️ Base de datos: Sin especialidades');
          issues.push('No hay especialidades en la base de datos');
        } else {
          checks.push(`✅ Base de datos: ${specialties.length} especialidades encontradas`);
          
          // Verificar estructura de los datos
          const firstSpecialty = specialties[0];
          const requiredFields = ['id', 'name', 'description', 'consultation_price'];
          const missingFields = requiredFields.filter(field => !(field in firstSpecialty));
          
          if (missingFields.length === 0) {
            checks.push('✅ Estructura de datos: Correcta');
          } else {
            checks.push(`❌ Estructura de datos: Faltan campos ${missingFields.join(', ')}`);
            issues.push('Estructura de datos incompleta');
          }
        }
      }
    } catch (error) {
      checks.push('❌ Error al verificar datos');
      issues.push('Error al obtener datos de especialidades');
    }
  }
  
  // Imprimir resultados
  console.log('\n📋 RESULTADOS DEL DIAGNÓSTICO');
  console.log('=' .repeat(50));
  
  checks.forEach(check => console.log(check));
  
  if (issues.length === 0) {
    console.log('\n🎉 ¡TODO ESTÁ FUNCIONANDO CORRECTAMENTE!');
    console.log('Si sigues teniendo problemas, revisa la consola para errores específicos.');
  } else {
    console.log('\n🚨 PROBLEMAS ENCONTRADOS:');
    issues.forEach((issue, index) => console.log(`${index + 1}. ${issue}`));
    
    console.log('\n💡 SOLUCIONES SUGERIDAS:');
    if (issues.includes('No se puede conectar al backend')) {
      console.log('- Asegúrate de que el servidor backend esté corriendo en puerto 8000');
      console.log('- Verifica que no haya problemas de CORS');
    }
    if (issues.includes('No hay token de autenticación')) {
      console.log('- Inicia sesión en la aplicación');
    }
    if (issues.includes('Token de autenticación expirado')) {
      console.log('- Cierra sesión e inicia sesión nuevamente');
    }
    if (issues.includes('Ningún endpoint de especialidades está funcionando')) {
      console.log('- Verifica que el controller de especialidades esté implementado en el backend');
      console.log('- Revisa las rutas en el backend');
    }
    if (issues.includes('No hay especialidades en la base de datos')) {
      console.log('- Crea algunas especialidades de prueba usando el modal');
      console.log('- O ejecuta: await createTestSpecialties()');
    }
  }
  
  console.log('\n🔧 COMANDOS ÚTILES:');
  console.log('- await testSpecialtyConnection() - Probar conexión');
  console.log('- await testSpecialtyCRUD() - Probar CRUD completo');
  console.log('- await createTestSpecialties() - Crear datos de prueba');
  console.log('- clearSpecialtyCache() - Limpiar cache');
  
  return {
    checks,
    issues,
    workingEndpoint,
    hasToken: !!token
  };
};

/**
 * Función para probar la conexión básica a especialidades
 */
export const testSpecialtyConnection = async () => {
  console.log('🧪 PROBANDO CONEXIÓN A ESPECIALIDADES');
  
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('❌ No hay token de autenticación');
    return false;
  }
  
  const endpoints = [
    '/api/catalogs/specialties/',
    '/api/catalogs/specialties',
    '/api/catalog/specialties/',
    '/api/v1/catalogs/specialties/',
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Probando: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        return endpoint;
      } else {
        const error = await response.text();
        console.log(`❌ Error: ${error}`);
      }
    } catch (error) {
      console.log(`❌ Error de red: ${error.message}`);
    }
  }
  
  return false;
};

/**
 * Función para probar todas las operaciones CRUD
 */
export const testSpecialtyCRUD = async () => {
  console.log('🧪 PROBANDO CRUD COMPLETO DE ESPECIALIDADES');
  
  const workingEndpoint = await testSpecialtyConnection();
  if (!workingEndpoint) {
    console.error('❌ No se pudo conectar a ningún endpoint');
    return false;
  }
  
  const token = localStorage.getItem('authToken');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  let createdSpecialtyId = null;
  
  try {
    // 1. CREATE - Crear especialidad de prueba
    console.log('1️⃣ Probando CREATE...');
    const createData = {
      name: `Especialidad Test ${Date.now()}`,
      description: 'Especialidad creada para pruebas del sistema',
      consultation_price: 100.00,
      discount_percentage: 5.0
    };
    
    const createResponse = await fetch(workingEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(createData)
    });
    
    if (createResponse.ok) {
      const created = await createResponse.json();
      createdSpecialtyId = created.id;
      console.log('✅ CREATE exitoso:', created);
    } else {
      const error = await createResponse.text();
      console.error('❌ CREATE falló:', error);
      return false;
    }
    
    // 2. READ - Leer especialidad creada
    console.log('2️⃣ Probando READ...');
    const readResponse = await fetch(`${workingEndpoint}${createdSpecialtyId}/`, {
      headers
    });
    
    if (readResponse.ok) {
      const read = await readResponse.json();
      console.log('✅ READ exitoso:', read);
    } else {
      console.error('❌ READ falló');
    }
    
    // 3. UPDATE - Actualizar especialidad
    console.log('3️⃣ Probando UPDATE...');
    const updateData = {
      ...createData,
      name: `${createData.name} - ACTUALIZADA`,
      consultation_price: 150.00
    };
    
    const updateResponse = await fetch(`${workingEndpoint}${createdSpecialtyId}/`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });
    
    if (updateResponse.ok) {
      const updated = await updateResponse.json();
      console.log('✅ UPDATE exitoso:', updated);
    } else {
      const error = await updateResponse.text();
      console.error('❌ UPDATE falló:', error);
    }
    
    // 4. DELETE - Eliminar especialidad
    console.log('4️⃣ Probando DELETE...');
    const deleteResponse = await fetch(`${workingEndpoint}${createdSpecialtyId}/`, {
      method: 'DELETE',
      headers
    });
    
    if (deleteResponse.ok || deleteResponse.status === 204) {
      console.log('✅ DELETE exitoso');
    } else {
      console.error('❌ DELETE falló');
    }
    
    console.log('🎉 ¡TODAS LAS OPERACIONES CRUD FUNCIONAN CORRECTAMENTE!');
    return true;
    
  } catch (error) {
    console.error('❌ Error durante las pruebas CRUD:', error);
    
    // Cleanup - intentar eliminar si se creó
    if (createdSpecialtyId) {
      try {
        await fetch(`${workingEndpoint}${createdSpecialtyId}/`, {
          method: 'DELETE',
          headers
        });
        console.log('🧹 Cleanup: Especialidad de prueba eliminada');
      } catch (cleanupError) {
        console.warn('⚠️ No se pudo eliminar la especialidad de prueba');
      }
    }
    
    return false;
  }
};

/**
 * Función para crear especialidades de prueba
 */
export const createTestSpecialties = async () => {
  console.log('🏥 CREANDO ESPECIALIDADES DE PRUEBA');
  
  const workingEndpoint = await testSpecialtyConnection();
  if (!workingEndpoint) {
    console.error('❌ No se pudo conectar a ningún endpoint');
    return false;
  }
  
  const token = localStorage.getItem('authToken');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const testSpecialties = [
    {
      name: 'Cardiología',
      description: 'Especialidad médica que se ocupa del diagnóstico y tratamiento de las enfermedades del corazón y del aparato circulatorio.',
      consultation_price: 180.00,
      discount_percentage: 10.0
    },
    {
      name: 'Neurología',
      description: 'Especialidad médica que trata los trastornos del sistema nervioso central, periférico y autónomo.',
      consultation_price: 200.00,
      discount_percentage: 5.0
    },
    {
      name: 'Pediatría',
      description: 'Especialidad médica que estudia al niño y sus enfermedades desde el nacimiento hasta la adolescencia.',
      consultation_price: 120.00,
      discount_percentage: 15.0
    },
    {
      name: 'Ginecología',
      description: 'Especialidad médica que se especializa en el sistema reproductor femenino.',
      consultation_price: 150.00,
      discount_percentage: 0.0
    },
    {
      name: 'Traumatología',
      description: 'Especialidad médica que se dedica al estudio de las lesiones del aparato locomotor.',
      consultation_price: 160.00,
      discount_percentage: 8.0
    }
  ];
  
  let created = 0;
  let errors = 0;
  
  for (const specialty of testSpecialties) {
    try {
      const response = await fetch(workingEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(specialty)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Creada: ${specialty.name}`, result);
        created++;
      } else {
        const error = await response.text();
        console.error(`❌ Error creando ${specialty.name}:`, error);
        errors++;
      }
    } catch (error) {
      console.error(`❌ Error de red creando ${specialty.name}:`, error);
      errors++;
    }
    
    // Pequeña pausa entre creaciones
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`📊 Resultado: ${created} creadas, ${errors} errores`);
  
  if (created > 0) {
    console.log('🎉 ¡Especialidades de prueba creadas exitosamente!');
    console.log('Recarga la página para ver los nuevos datos');
    return true;
  } else {
    console.log('❌ No se pudieron crear especialidades de prueba');
    return false;
  }
};

/**
 * Función para limpiar cache del navegador relacionado con especialidades
 */
export const clearSpecialtyCache = () => {
  console.log('🧹 LIMPIANDO CACHE DE ESPECIALIDADES');
  
  // Limpiar LocalStorage relacionado
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('specialty') || key.includes('specialties'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Eliminado: ${key}`);
  });
  
  // Limpiar SessionStorage relacionado
  const sessionKeysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('specialty') || key.includes('specialties'))) {
      sessionKeysToRemove.push(key);
    }
  }
  
  sessionKeysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`🗑️ Session eliminado: ${key}`);
  });
  
  // Limpiar cache de React Query si está disponible
  if (window.queryClient) {
    window.queryClient.invalidateQueries(['specialties']);
    console.log('🔄 Cache de React Query invalidado');
  }
  
  console.log('✅ Cache limpiado completamente');
  console.log('💡 Recarga la página para aplicar los cambios');
};

/**
 * Función para mostrar información del sistema
 */
export const showSystemInfo = () => {
  console.log('ℹ️ INFORMACIÓN DEL SISTEMA');
  console.log('=' .repeat(50));
  console.log(`🌐 URL actual: ${window.location.href}`);
  console.log(`🔑 Token presente: ${!!localStorage.getItem('authToken')}`);
  console.log(`👤 Usuario: ${localStorage.getItem('userEmail') || 'No disponible'}`);
  console.log(`🕒 Hora actual: ${new Date().toLocaleString()}`);
  console.log(`📱 User Agent: ${navigator.userAgent}`);
  console.log(`🌍 Idioma: ${navigator.language}`);
  console.log(`📡 Conexión: ${navigator.onLine ? 'Online' : 'Offline'}`);
  
  // Información de React
  const reactVersion = window.React?.version || 'No detectado';
  console.log(`⚛️ React: ${reactVersion}`);
  
  // Información del bundle
  console.log(`📦 Vite: ${import.meta.env.DEV ? 'Desarrollo' : 'Producción'}`);
  console.log(`🔧 Base URL: ${import.meta.env.BASE_URL}`);
};

/**
 * Utilidades para depurar y diagnosticar problemas con especialidades
 */

/**
 * Comprueba si el objeto de especialidades tiene la estructura correcta
 * @param {Object} specialties - Objeto de especialidades a verificar
 * @returns {Object} Resultado del diagnóstico
 */
export const checkSpecialtiesStructure = (specialties) => {
  const result = {
    isValid: false,
    hasResults: false,
    resultsIsArray: false,
    count: 0,
    messages: []
  };
  
  // Verificar si el objeto existe
  if (!specialties) {
    result.messages.push('El objeto specialties es nulo o indefinido');
    return result;
  }
  
  // Verificar si tiene propiedad results
  if (!specialties.results) {
    result.messages.push('El objeto specialties no tiene una propiedad results');
    return result;
  }
  
  result.hasResults = true;
  
  // Verificar si results es un array
  if (!Array.isArray(specialties.results)) {
    result.messages.push('La propiedad results no es un array');
    return result;
  }
  
  result.resultsIsArray = true;
  result.count = specialties.results.length;
  
  // Verificar si el array está vacío
  if (specialties.results.length === 0) {
    result.messages.push('El array de especialidades está vacío');
    return result;
  }
  
  // Verificar estructura de las especialidades
  const firstItem = specialties.results[0];
  if (!firstItem.id) {
    result.messages.push('Las especialidades no tienen una propiedad id');
    return result;
  }
  
  if (!firstItem.name) {
    result.messages.push('Las especialidades no tienen una propiedad name');
  }
  
  // Si llegamos aquí, la estructura es válida
  result.isValid = true;
  result.messages.push('La estructura de especialidades es válida');
  
  return result;
};

/**
 * Verifica la consistencia de IDs de especialidades en un doctor
 * @param {Object} doctor - Objeto de doctor a verificar
 * @param {Object} specialtiesList - Lista completa de especialidades
 * @returns {Object} Resultado del diagnóstico
 */
export const checkDoctorSpecialties = (doctor, specialtiesList) => {
  const result = {
    isValid: false,
    hasSpecialties: false,
    specialtiesIsArray: false,
    specialtiesCount: 0,
    validSpecialties: [],
    invalidSpecialties: [],
    messages: []
  };
  
  // Verificar si el doctor existe
  if (!doctor) {
    result.messages.push('El objeto doctor es nulo o indefinido');
    return result;
  }
  
  // Verificar si tiene especialidades
  if (!doctor.specialties) {
    result.messages.push('El doctor no tiene especialidades definidas');
    return result;
  }
  
  result.hasSpecialties = true;
  
  // Verificar si especialidades es un array
  if (!Array.isArray(doctor.specialties)) {
    result.messages.push('Las especialidades del doctor no son un array');
    return result;
  }
  
  result.specialtiesIsArray = true;
  result.specialtiesCount = doctor.specialties.length;
  
  // Verificar si el array está vacío
  if (doctor.specialties.length === 0) {
    result.messages.push('El doctor no tiene especialidades asignadas');
    return result;
  }
  
  // Verificar que la lista de especialidades exista
  if (!specialtiesList || !specialtiesList.results || !Array.isArray(specialtiesList.results)) {
    result.messages.push('No se proporcionó una lista válida de especialidades');
    return result;
  }
  
  // Comprobar cada especialidad del doctor
  doctor.specialties.forEach(specialty => {
    let specialtyId;
    
    // Determinar el ID según el formato
    if (typeof specialty === 'number') {
      specialtyId = specialty;
    } else if (typeof specialty === 'object' && specialty.id) {
      specialtyId = specialty.id;
    } else if (typeof specialty === 'object' && specialty.specialty) {
      specialtyId = typeof specialty.specialty === 'object' ? specialty.specialty.id : specialty.specialty;
    } else if (typeof specialty === 'string' && /^\d+$/.test(specialty)) {
      specialtyId = parseInt(specialty, 10);
    } else {
      result.invalidSpecialties.push(specialty);
      return;
    }
    
    // Verificar si existe en la lista completa
    const exists = specialtiesList.results.some(s => {
      const id = typeof s.id === 'string' ? parseInt(s.id, 10) : s.id;
      return id === specialtyId;
    });
    
    if (exists) {
      result.validSpecialties.push(specialtyId);
    } else {
      result.invalidSpecialties.push(specialty);
    }
  });
  
  // Evaluar resultado
  if (result.invalidSpecialties.length === 0) {
    result.isValid = true;
    result.messages.push(`Todas las especialidades del doctor son válidas (${result.validSpecialties.length})`);
  } else {
    result.messages.push(`Se encontraron ${result.invalidSpecialties.length} especialidades inválidas`);
  }
  
  return result;
};

/**
 * Limpia y corrige las especialidades de un doctor
 * @param {Object} doctor - Doctor a corregir
 * @param {Object} specialtiesList - Lista completa de especialidades
 * @returns {Object} Doctor con especialidades corregidas
 */
export const fixDoctorSpecialties = (doctor, specialtiesList) => {
  if (!doctor) return null;
  
  // Clonar para no modificar el original
  const fixedDoctor = { ...doctor };
  
  // Si no tiene especialidades, inicializar como array vacío
  if (!fixedDoctor.specialties) {
    fixedDoctor.specialties = [];
    return fixedDoctor;
  }
  
  // Si no es array, convertir
  if (!Array.isArray(fixedDoctor.specialties)) {
    if (typeof fixedDoctor.specialties === 'object') {
      // Intentar extraer valores si es un objeto
      fixedDoctor.specialties = Object.values(fixedDoctor.specialties)
        .filter(val => val !== null && val !== undefined);
    } else {
      // Si no es objeto ni array, inicializar como array vacío
      fixedDoctor.specialties = [];
      return fixedDoctor;
    }
  }
  
  // Filtrar y normalizar especialidades válidas
  if (specialtiesList && specialtiesList.results && Array.isArray(specialtiesList.results)) {
    fixedDoctor.specialties = fixedDoctor.specialties
      .map(specialty => {
        let specialtyId;
        
        // Extraer ID según formato
        if (typeof specialty === 'number') {
          specialtyId = specialty;
        } else if (typeof specialty === 'object' && specialty.id) {
          specialtyId = specialty.id;
        } else if (typeof specialty === 'object' && specialty.specialty) {
          specialtyId = typeof specialty.specialty === 'object' ? specialty.specialty.id : specialty.specialty;
        } else if (typeof specialty === 'string' && /^\d+$/.test(specialty)) {
          specialtyId = parseInt(specialty, 10);
        } else {
          return null;
        }
        
        // Verificar si existe en la lista
        const exists = specialtiesList.results.some(s => {
          const id = typeof s.id === 'string' ? parseInt(s.id, 10) : s.id;
          return id === specialtyId;
        });
        
        return exists ? specialtyId : null;
      })
      .filter(id => id !== null);
  }
  
  return fixedDoctor;
};

/**
 * Diagnostica problemas de especialidades y muestra un reporte
 */
export const runSpecialtiesDiagnostic = (specialties, doctors) => {
  console.group('📊 DIAGNÓSTICO DE ESPECIALIDADES');
  
  // Verificar estructura de especialidades
  console.log('Verificando estructura de especialidades...');
  const structureCheck = checkSpecialtiesStructure(specialties);
  
  if (structureCheck.isValid) {
    console.log('✅ Estructura de especialidades correcta');
  } else {
    console.warn('⚠️ Problemas en la estructura de especialidades:');
    structureCheck.messages.forEach(msg => console.warn(`  - ${msg}`));
  }
  
  // Si hay doctores, verificar sus especialidades
  if (doctors && Array.isArray(doctors)) {
    console.log(`\nVerificando especialidades de ${doctors.length} doctores...`);
    
    let validCount = 0;
    let invalidCount = 0;
    
    doctors.forEach(doctor => {
      const check = checkDoctorSpecialties(doctor, specialties);
      if (check.isValid) {
        validCount++;
      } else {
        invalidCount++;
        console.warn(`⚠️ Doctor ${doctor.id} (${doctor.first_name} ${doctor.last_name}): ${check.messages.join(', ')}`);
      }
    });
    
    console.log(`✅ ${validCount} doctores con especialidades válidas`);
    if (invalidCount > 0) {
      console.warn(`⚠️ ${invalidCount} doctores con problemas de especialidades`);
    }
  }
  
  console.groupEnd();
  
  return {
    structureValid: structureCheck.isValid,
    messages: structureCheck.messages
  };
};

export default {
  checkSpecialtiesStructure,
  checkDoctorSpecialties,
  fixDoctorSpecialties,
  runSpecialtiesDiagnostic
};

// Hacer las funciones disponibles globalmente para debugging
if (typeof window !== 'undefined') {
  window.diagnoseSpecialtyIssues = diagnoseSpecialtyIssues;
  window.testSpecialtyConnection = testSpecialtyConnection;
  window.testSpecialtyCRUD = testSpecialtyCRUD;
  window.createTestSpecialties = createTestSpecialties;
  window.clearSpecialtyCache = clearSpecialtyCache;
  window.showSystemInfo = showSystemInfo;
}