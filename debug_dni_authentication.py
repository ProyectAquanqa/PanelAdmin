#!/usr/bin/env python
"""
Script de diagnóstico para el problema de autenticación del endpoint consultar_dni
Ejecutar en el directorio de Django: python manage.py shell < debug_dni_authentication.py
"""

import os
import django
from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import RequestFactory
from rest_framework.test import APIRequestFactory
from rest_framework_simplejwt.tokens import AccessToken
import json

print("=== DIAGNÓSTICO DE AUTENTICACIÓN DNI ===")
print()

# 1. Verificar configuración JWT
print("1. CONFIGURACIÓN JWT:")
print(f"   - JWT Settings: {getattr(settings, 'SIMPLE_JWT', 'No configurado')}")
print(f"   - DRF Auth Classes: {getattr(settings, 'REST_FRAMEWORK', {}).get('DEFAULT_AUTHENTICATION_CLASSES', 'No configurado')}")
print()

# 2. Verificar usuario admin
User = get_user_model()
try:
    admin_user = User.objects.get(username='admin')
    print("2. USUARIO ADMIN:")
    print(f"   - Username: {admin_user.username}")
    print(f"   - Is Active: {admin_user.is_active}")
    print(f"   - Is Staff: {admin_user.is_staff}")
    print(f"   - Is Superuser: {admin_user.is_superuser}")
    print(f"   - Groups: {[g.name for g in admin_user.groups.all()]}")
    print()
    
    # 3. Generar token JWT para el usuario
    print("3. GENERACIÓN DE TOKEN:")
    token = AccessToken.for_user(admin_user)
    print(f"   - Token generado: {str(token)[:50]}...")
    print(f"   - Token válido: {token.check_blacklist() is None}")
    print()
    
except User.DoesNotExist:
    print("2. ERROR: Usuario 'admin' no encontrado")
    print()

# 4. Verificar configuración de la API DNI
print("4. CONFIGURACIÓN API DNI:")
print(f"   - DNI_API_URL: {getattr(settings, 'DNI_API_URL', 'No configurado')}")
print(f"   - DNI_API_BEARER_TOKEN: {'Configurado' if getattr(settings, 'DNI_API_BEARER_TOKEN', None) else 'No configurado'}")
print()

# 5. Verificar el endpoint consultar_dni
print("5. VERIFICACIÓN DEL ENDPOINT:")
try:
    from users.views import UsuarioViewSet
    viewset = UsuarioViewSet()
    
    # Verificar si el método existe
    if hasattr(viewset, 'consultar_dni'):
        print("   - Método consultar_dni: ✅ Existe")
        
        # Verificar decoradores
        method = getattr(viewset, 'consultar_dni')
        if hasattr(method, 'mapping'):
            print(f"   - Mapping: {method.mapping}")
        if hasattr(method, 'detail'):
            print(f"   - Detail: {method.detail}")
        if hasattr(method, 'permission_classes'):
            print(f"   - Permission Classes: {method.permission_classes}")
        else:
            print("   - Permission Classes: No definidas específicamente")
    else:
        print("   - Método consultar_dni: ❌ No existe")
        
except ImportError as e:
    print(f"   - Error importando UsuarioViewSet: {e}")
print()

# 6. Simular petición autenticada
print("6. SIMULACIÓN DE PETICIÓN:")
try:
    from rest_framework.test import APIClient
    from rest_framework_simplejwt.tokens import RefreshToken
    
    client = APIClient()
    
    # Generar tokens para el usuario admin
    refresh = RefreshToken.for_user(admin_user)
    access_token = str(refresh.access_token)
    
    # Configurar autenticación
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    
    # Hacer petición de prueba al endpoint
    response = client.post('/api/users/consultar_dni/', 
                          data={'dni': '12345678'}, 
                          format='json')
    
    print(f"   - Status Code: {response.status_code}")
    print(f"   - Response: {response.data if hasattr(response, 'data') else response.content}")
    
    if response.status_code == 401:
        print("   - ❌ PROBLEMA CONFIRMADO: Endpoint devuelve 401 con token válido")
    elif response.status_code == 200:
        print("   - ✅ Endpoint funciona correctamente")
    else:
        print(f"   - ⚠️ Respuesta inesperada: {response.status_code}")
        
except Exception as e:
    print(f"   - Error en simulación: {e}")

print()
print("=== FIN DEL DIAGNÓSTICO ===")
print()
print("INSTRUCCIONES:")
print("1. Copia este script a tu directorio de Django (donde está manage.py)")
print("2. Ejecuta: python manage.py shell < debug_dni_authentication.py")
print("3. Comparte el output completo para identificar el problema exacto")