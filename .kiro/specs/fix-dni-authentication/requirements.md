# Requirements Document

## Introduction

El sistema de consulta de DNI está fallando con error 401 (Unauthorized) a pesar de que el usuario tiene permisos de superuser y el token JWT se refresca correctamente. El problema está en el backend de Django, específicamente en el endpoint `/api/users/consultar_dni/` que no está procesando correctamente la autenticación JWT.

## Requirements

### Requirement 1

**User Story:** Como desarrollador, quiero que el endpoint de consulta DNI funcione correctamente con autenticación JWT, para que los usuarios con permisos puedan consultar datos de DNI sin errores 401.

#### Acceptance Criteria

1. WHEN un usuario autenticado con permisos de Admin, QA o superuser hace una petición POST a `/api/users/consultar_dni/` THEN el sistema SHALL procesar la petición sin devolver error 401
2. WHEN el token JWT es válido y el usuario tiene los permisos correctos THEN el sistema SHALL permitir el acceso al endpoint de consulta DNI
3. WHEN se envía un DNI válido de 8 dígitos THEN el sistema SHALL consultar la API externa y devolver los datos correspondientes

### Requirement 2

**User Story:** Como usuario con permisos de administrador, quiero que la consulta de DNI funcione automáticamente al crear usuarios, para que los campos de nombre y apellido se autocompleten correctamente.

#### Acceptance Criteria

1. WHEN ingreso un DNI válido en el modal de creación de usuario THEN el sistema SHALL consultar automáticamente los datos del DNI
2. WHEN la consulta de DNI es exitosa THEN los campos de nombres y apellidos SHALL autocompletarse con los datos obtenidos
3. WHEN hay un error en la consulta de DNI THEN el sistema SHALL mostrar un mensaje de error específico y permitir continuar con la creación manual

### Requirement 3

**User Story:** Como desarrollador, quiero que el sistema de autenticación JWT funcione consistentemente en todos los endpoints, para que no haya problemas de autorización intermitentes.

#### Acceptance Criteria

1. WHEN el token JWT expira THEN el sistema SHALL refrescarlo automáticamente usando el refresh token
2. WHEN el refresh token es válido THEN el sistema SHALL obtener un nuevo access token y reintentar la petición original
3. WHEN tanto el access token como el refresh token son inválidos THEN el sistema SHALL redirigir al usuario al login