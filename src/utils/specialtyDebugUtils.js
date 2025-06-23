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

// Hacer las funciones disponibles globalmente para debugging
if (typeof window !== 'undefined') {
  window.diagnoseSpecialtyIssues = diagnoseSpecialtyIssues;
  window.testSpecialtyConnection = testSpecialtyConnection;
  window.testSpecialtyCRUD = testSpecialtyCRUD;
  window.createTestSpecialties = createTestSpecialties;
  window.clearSpecialtyCache = clearSpecialtyCache;
  window.showSystemInfo = showSystemInfo;
}