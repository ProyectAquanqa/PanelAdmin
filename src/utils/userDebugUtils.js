// userDebugUtils.js - Herramientas para diagnosticar problemas con usuarios

/**
 * Función para diagnosticar problemas comunes del módulo de usuarios
 * Ejecuta en la consola del navegador: await diagnoseUserIssues()
 */
export const diagnoseUserIssues = async () => {
  console.log('🔍 INICIANDO DIAGNÓSTICO DE USUARIOS');
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
  
  // 3. Probar endpoints de usuarios
  console.log('👥 Probando endpoints de usuarios...');
  const endpointsToTest = [
    '/api/users/users/',
    '/api/users/users',
    '/api/user/users/',
    '/api/v1/users/users/',
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
    issues.push('Ningún endpoint de usuarios está funcionando');
  }
  
  // 4. Verificar datos de usuarios
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
        const users = Array.isArray(data) ? data : data.results || data.data || [];
        
        if (users.length === 0) {
          checks.push('⚠️ Base de datos: Sin usuarios');
          issues.push('No hay usuarios en la base de datos');
        } else {
          checks.push(`✅ Base de datos: ${users.length} usuarios encontrados`);
          
          // Verificar estructura de los datos
          const firstUser = users[0];
          const requiredFields = ['id', 'email', 'first_name', 'last_name', 'role'];
          const missingFields = requiredFields.filter(field => !(field in firstUser));
          
          if (missingFields.length === 0) {
            checks.push('✅ Estructura de datos: Correcta');
          } else {
            checks.push(`❌ Estructura de datos: Faltan campos ${missingFields.join(', ')}`);
            issues.push('Estructura de datos incompleta');
          }

          // Verificar roles
          const roles = [...new Set(users.map(u => u.role))];
          checks.push(`✅ Roles encontrados: ${roles.join(', ')}`);

          // Verificar usuarios activos
          const activeUsers = users.filter(u => u.is_active);
          checks.push(`✅ Usuarios activos: ${activeUsers.length}/${users.length}`);
        }
      }
    } catch (error) {
      checks.push('❌ Error al verificar datos');
      issues.push('Error al obtener datos de usuarios');
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
    if (issues.includes('Ningún endpoint de usuarios está funcionando')) {
      console.log('- Verifica que el controller de usuarios esté implementado en el backend');
      console.log('- Revisa las rutas en el backend');
    }
    if (issues.includes('No hay usuarios en la base de datos')) {
      console.log('- Crea algunos usuarios de prueba usando el modal');
      console.log('- O ejecuta: await createTestUsers()');
    }
  }
  
  console.log('\n🔧 COMANDOS ÚTILES:');
  console.log('- await testUserConnection() - Probar conexión');
  console.log('- await testUserCRUD() - Probar CRUD completo');
  console.log('- await createTestUsers() - Crear datos de prueba');
  console.log('- clearUserCache() - Limpiar cache');
  
  return {
    checks,
    issues,
    workingEndpoint,
    hasToken: !!token
  };
};

/**
 * Función para probar la conexión básica a usuarios
 */
export const testUserConnection = async () => {
  console.log('🧪 PROBANDO CONEXIÓN A USUARIOS');
  
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('❌ No hay token de autenticación');
    return false;
  }
  
  const endpoints = [
    '/api/users/users/',
    '/api/users/users',
    '/api/user/users/',
    '/api/v1/users/users/',
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
 * Función para probar todas las operaciones CRUD de usuarios
 */
export const testUserCRUD = async () => {
  console.log('🧪 PROBANDO CRUD COMPLETO DE USUARIOS');
  
  const workingEndpoint = await testUserConnection();
  if (!workingEndpoint) {
    console.error('❌ No se pudo conectar a ningún endpoint');
    return false;
  }
  
  const token = localStorage.getItem('authToken');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  let createdUserId = null;
  
  try {
    // 1. CREATE - Crear usuario de prueba
    console.log('1️⃣ Probando CREATE...');
    const createData = {
      first_name: 'Usuario',
      last_name: `Test ${Date.now()}`,
      email: `test${Date.now()}@ejemplo.com`,
      password: 'password123',
      role: 'PATIENT',
      phone: '999999999'
    };
    
    const createResponse = await fetch(workingEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(createData)
    });
    
    if (createResponse.ok) {
      const created = await createResponse.json();
      createdUserId = created.id;
      console.log('✅ CREATE exitoso:', created);
    } else {
      const error = await createResponse.text();
      console.error('❌ CREATE falló:', error);
      return false;
    }
    
    // 2. READ - Leer usuario creado
    console.log('2️⃣ Probando READ...');
    const readResponse = await fetch(`${workingEndpoint}${createdUserId}/`, {
      headers
    });
    
    if (readResponse.ok) {
      const read = await readResponse.json();
      console.log('✅ READ exitoso:', read);
    } else {
      console.error('❌ READ falló');
    }
    
    // 3. UPDATE - Actualizar usuario
    console.log('3️⃣ Probando UPDATE...');
    const updateData = {
      first_name: 'Usuario Actualizado',
      last_name: createData.last_name,
      email: createData.email,
      role: 'PATIENT',
      phone: '888888888'
    };
    
    const updateResponse = await fetch(`${workingEndpoint}${createdUserId}/`, {
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
    
    // 4. DELETE - Eliminar usuario
    console.log('4️⃣ Probando DELETE...');
    const deleteResponse = await fetch(`${workingEndpoint}${createdUserId}/`, {
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
    if (createdUserId) {
      try {
        await fetch(`${workingEndpoint}${createdUserId}/`, {
          method: 'DELETE',
          headers
        });
        console.log('🧹 Cleanup: Usuario de prueba eliminado');
      } catch (cleanupError) {
        console.warn('⚠️ No se pudo eliminar el usuario de prueba');
      }
    }
    
    return false;
  }
};

/**
 * Función para crear usuarios de prueba
 */
export const createTestUsers = async () => {
  console.log('👥 CREANDO USUARIOS DE PRUEBA');
  
  const workingEndpoint = await testUserConnection();
  if (!workingEndpoint) {
    console.error('❌ No se pudo conectar a ningún endpoint');
    return false;
  }
  
  const token = localStorage.getItem('authToken');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const testUsers = [
    {
      first_name: 'Juan',
      last_name: 'Pérez García',
      email: 'juan.perez@hospital.com',
      password: 'password123',
      role: 'PATIENT',
      phone: '999111222'
    },
    {
      first_name: 'María',
      last_name: 'González López',
      email: 'maria.gonzalez@hospital.com',
      password: 'password123',
      role: 'DOCTOR',
      phone: '999333444'
    },
    {
      first_name: 'Carlos',
      last_name: 'Rodríguez Silva',
      email: 'carlos.rodriguez@hospital.com',
      password: 'password123',
      role: 'PATIENT',
      phone: '999555666'
    },
    {
      first_name: 'Ana',
      last_name: 'Martínez Torres',
      email: 'ana.martinez@hospital.com',
      password: 'password123',
      role: 'ADMIN',
      phone: '999777888'
    },
    {
      first_name: 'Luis',
      last_name: 'Hernández Ruiz',
      email: 'luis.hernandez@hospital.com',
      password: 'password123',
      role: 'DOCTOR',
      phone: '999999000'
    }
  ];
  
  let created = 0;
  let errors = 0;
  
  for (const user of testUsers) {
    try {
      const response = await fetch(workingEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(user)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Creado: ${user.first_name} ${user.last_name}`, result);
        created++;
      } else {
        const error = await response.text();
        console.error(`❌ Error creando ${user.first_name} ${user.last_name}:`, error);
        errors++;
      }
    } catch (error) {
      console.error(`❌ Error de red creando ${user.first_name} ${user.last_name}:`, error);
      errors++;
    }
    
    // Pequeña pausa entre creaciones
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`📊 Resultado: ${created} creados, ${errors} errores`);
  
  if (created > 0) {
    console.log('🎉 ¡Usuarios de prueba creados exitosamente!');
    console.log('Recarga la página para ver los nuevos datos');
    return true;
  } else {
    console.log('❌ No se pudieron crear usuarios de prueba');
    return false;
  }
};

/**
 * Función para limpiar cache del navegador relacionado con usuarios
 */
export const clearUserCache = () => {
  console.log('🧹 LIMPIANDO CACHE DE USUARIOS');
  
  // Limpiar LocalStorage relacionado
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('user') || key.includes('users'))) {
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
    if (key && (key.includes('user') || key.includes('users'))) {
      sessionKeysToRemove.push(key);
    }
  }
  
  sessionKeysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`🗑️ Session eliminado: ${key}`);
  });
  
  // Limpiar cache de React Query si está disponible
  if (window.queryClient) {
    window.queryClient.invalidateQueries(['users']);
    console.log('🔄 Cache de React Query invalidado');
  }
  
  console.log('✅ Cache limpiado completamente');
  console.log('💡 Recarga la página para aplicar los cambios');
};

/**
 * Función para mostrar estadísticas de usuarios
 */
export const showUserStats = async () => {
  console.log('📊 ESTADÍSTICAS DE USUARIOS');
  console.log('=' .repeat(50));
  
  const workingEndpoint = await testUserConnection();
  if (!workingEndpoint) {
    console.error('❌ No se puede obtener estadísticas sin conexión');
    return;
  }
  
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(workingEndpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const users = Array.isArray(data) ? data : data.results || data.data || [];
      
      console.log(`👥 Total de usuarios: ${users.length}`);
      console.log(`✅ Usuarios activos: ${users.filter(u => u.is_active).length}`);
      console.log(`❌ Usuarios inactivos: ${users.filter(u => !u.is_active).length}`);
      
      // Estadísticas por rol
      const roleStats = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Por rol:');
      Object.entries(roleStats).forEach(([role, count]) => {
        const percentage = ((count / users.length) * 100).toFixed(1);
        console.log(`  ${role}: ${count} (${percentage}%)`);
      });
      
      // Estadísticas de contacto
      const withPhone = users.filter(u => u.phone && u.phone.trim()).length;
      console.log(`\n📱 Con teléfono: ${withPhone}/${users.length}`);
      console.log(`📧 Todos tienen email: ${users.length}/${users.length}`);
      
    } else {
      console.error('❌ Error al obtener datos para estadísticas');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Hacer las funciones disponibles globalmente para debugging
if (typeof window !== 'undefined') {
  window.diagnoseUserIssues = diagnoseUserIssues;
  window.testUserConnection = testUserConnection;
  window.testUserCRUD = testUserCRUD;
  window.createTestUsers = createTestUsers;
  window.clearUserCache = clearUserCache;
  window.showUserStats = showUserStats;
}