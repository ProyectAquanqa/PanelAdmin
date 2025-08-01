# Design Document

## Overview

El problema de autenticación 401 en el endpoint `/api/users/consultar_dni/` se debe a una configuración incorrecta en el backend de Django. A pesar de que el usuario tiene permisos de superuser y el token JWT se refresca correctamente, el endpoint sigue devolviendo error 401. La solución requiere identificar y corregir la configuración de autenticación en el backend Django.

## Architecture

### Current Problem Analysis
- **Frontend**: Envía token JWT válido en header Authorization
- **Token Refresh**: Funciona correctamente (se ve en logs)
- **User Permissions**: Usuario tiene rol Admin y superuser
- **Backend Response**: 401 Unauthorized persistente

### Root Cause Hypothesis
1. **Middleware de autenticación mal configurado** en Django
2. **Decorador de permisos incorrecto** en el endpoint consultar_dni
3. **Configuración JWT incorrecta** en Django REST Framework
4. **CORS issues** que interfieren con headers de autenticación

## Components and Interfaces

### 1. Django Authentication Middleware
- **Component**: JWT Authentication middleware
- **Interface**: Procesa headers Authorization con Bearer tokens
- **Issue**: Posiblemente no está configurado correctamente para este endpoint específico

### 2. Django Views - consultar_dni Endpoint
- **Component**: UsuarioViewSet.consultar_dni method
- **Interface**: @action decorator con permission_classes
- **Issue**: Configuración de permisos o autenticación incorrecta

### 3. Django REST Framework Settings
- **Component**: DRF authentication classes
- **Interface**: DEFAULT_AUTHENTICATION_CLASSES setting
- **Issue**: Configuración JWT posiblemente incompleta

### 4. Frontend Token Management
- **Component**: userService.js apiCall function
- **Interface**: Automatic token refresh and retry logic
- **Status**: ✅ Working correctly (confirmed by logs)

## Data Models

### JWT Token Structure
```javascript
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### DNI Consultation Request
```javascript
{
  "dni": "12345678"
}
```

### Expected DNI Response
```javascript
{
  "status": "success",
  "data": {
    "nombres": "JUAN CARLOS",
    "apellido_paterno": "PEREZ",
    "apellido_materno": "RODRIGUEZ"
  }
}
```

## Error Handling

### Current Error Flow
1. Frontend sends POST to `/api/users/consultar_dni/`
2. Django returns 401 Unauthorized
3. Frontend attempts token refresh
4. Token refresh succeeds (200 response)
5. Frontend retries original request
6. Django still returns 401 Unauthorized

### Proposed Error Handling
1. **Django Level**: Proper JWT authentication configuration
2. **Endpoint Level**: Correct permission decorators
3. **Frontend Level**: Enhanced error reporting for debugging

## Testing Strategy

### 1. Backend Authentication Testing
- Test JWT token validation in Django shell
- Verify middleware configuration
- Check endpoint-specific authentication

### 2. API Endpoint Testing
- Direct API testing with curl/Postman
- Verify headers are being processed correctly
- Test with different user permission levels

### 3. Integration Testing
- End-to-end testing from React frontend
- Token refresh flow testing
- Error scenario testing

## Implementation Plan

### Phase 1: Django Backend Fixes
1. **Verify JWT Configuration** in settings.py
2. **Check Authentication Middleware** order and configuration
3. **Review consultar_dni endpoint** decorators and permissions
4. **Test authentication** in Django shell

### Phase 2: Endpoint-Specific Fixes
1. **Simplify permission decorators** temporarily for testing
2. **Add debug logging** to Django endpoint
3. **Verify CORS configuration** for authentication headers
4. **Test with minimal authentication** requirements

### Phase 3: Frontend Enhancements
1. **Add more detailed error logging** for debugging
2. **Implement fallback mechanisms** for authentication failures
3. **Enhance user feedback** for authentication issues

## Design Decisions

### Decision 1: Focus on Backend Configuration
**Rationale**: Frontend token management is working correctly (confirmed by logs), so the issue is in Django backend configuration.

### Decision 2: Systematic Debugging Approach
**Rationale**: Start with simplest authentication configuration and gradually add complexity to isolate the exact issue.

### Decision 3: Maintain Current Frontend Logic
**Rationale**: The automatic token refresh and retry logic is working correctly and should be preserved.

## Security Considerations

- Ensure JWT tokens are properly validated
- Maintain proper permission checking after fixing authentication
- Avoid exposing sensitive debugging information in production
- Ensure CORS configuration doesn't compromise security