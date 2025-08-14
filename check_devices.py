#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aquanq_noticias.settings')
django.setup()

from notificaciones.models import DeviceToken
from users.models import User

print("=== VERIFICANDO DATOS DISPOSITIVOS ===")
print(f"Total DeviceTokens en BD: {DeviceToken.objects.count()}")
print()

if DeviceToken.objects.exists():
    print("Primeros 5 tokens:")
    for token in DeviceToken.objects.all()[:5]:
        print(f"- ID: {token.id}")
        print(f"  Type: {token.device_type}")
        print(f"  Active: {token.is_active}")
        print(f"  User: {token.user}")
        print(f"  Token: {token.token[:50]}...")
        print()
else:
    print("❌ NO HAY TOKENS EN LA BASE DE DATOS")
    print()
    print("Usuarios disponibles:")
    users = User.objects.all()[:3]
    for user in users:
        print(f"- {user.username} ({user.email})")
