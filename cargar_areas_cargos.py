#!/usr/bin/env python3
"""
Script para cargar áreas y cargos de prueba en el sistema
Ejecutar: python cargar_areas_cargos.py
"""
import os
import sys
import django
from django.db import transaction

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aquanq_noticias.settings')
django.setup()

from areas.models import Area, Cargo

def cargar_datos():
    """Carga datos de áreas y cargos de ejemplo"""
    
    print("🚀 Iniciando carga de áreas y cargos...")
    
    # Datos de áreas
    areas_data = [
        {
            'nombre': 'Administración',
            'descripcion': 'Área encargada de la gestión administrativa y financiera de la empresa'
        },
        {
            'nombre': 'Recursos Humanos',
            'descripcion': 'Gestión del talento humano, nómina y bienestar laboral'
        },
        {
            'nombre': 'Tecnología',
            'descripcion': 'Desarrollo de software, infraestructura IT y soporte técnico'
        },
        {
            'nombre': 'Ventas',
            'descripcion': 'Gestión de ventas, atención al cliente y desarrollo comercial'
        },
        {
            'nombre': 'Marketing',
            'descripcion': 'Marketing digital, publicidad y estrategias de comunicación'
        },
        {
            'nombre': 'Operaciones',
            'descripcion': 'Gestión de procesos operativos y logística'
        },
        {
            'nombre': 'Finanzas',
            'descripcion': 'Contabilidad, presupuestos y análisis financiero'
        }
    ]
    
    # Datos de cargos por área
    cargos_data = {
        'Administración': [
            'Gerente General',
            'Asistente Administrativo',
            'Coordinador Administrativo',
            'Secretaria Ejecutiva'
        ],
        'Recursos Humanos': [
            'Gerente de RRHH',
            'Especialista en Reclutamiento',
            'Analista de Nómina',
            'Coordinador de Bienestar'
        ],
        'Tecnología': [
            'CTO - Director de Tecnología',
            'Desarrollador Senior',
            'Desarrollador Junior',
            'Arquitecto de Software',
            'DevOps Engineer',
            'QA Tester',
            'Soporte Técnico'
        ],
        'Ventas': [
            'Gerente de Ventas',
            'Ejecutivo de Ventas',
            'Asesor Comercial',
            'Coordinador de Ventas'
        ],
        'Marketing': [
            'Gerente de Marketing',
            'Especialista en Marketing Digital',
            'Community Manager',
            'Diseñador Gráfico',
            'Analista de Marketing'
        ],
        'Operaciones': [
            'Gerente de Operaciones',
            'Coordinador Logístico',
            'Supervisor de Producción',
            'Analista de Procesos'
        ],
        'Finanzas': [
            'Gerente Financiero',
            'Contador General',
            'Analista Financiero',
            'Asistente Contable'
        ]
    }
    
    try:
        with transaction.atomic():
            # Limpiar datos existentes (opcional)
            print("🗑️  Limpiando datos existentes...")
            Cargo.objects.all().delete()
            Area.objects.all().delete()
            
            # Crear áreas
            print("📁 Creando áreas...")
            areas_creadas = {}
            for area_data in areas_data:
                area = Area.objects.create(
                    nombre=area_data['nombre'],
                    descripcion=area_data['descripcion'],
                    is_active=True
                )
                areas_creadas[area.nombre] = area
                print(f"  ✅ Área creada: {area.nombre}")
            
            # Crear cargos
            print("👔 Creando cargos...")
            cargos_total = 0
            for area_nombre, cargos_lista in cargos_data.items():
                if area_nombre in areas_creadas:
                    area = areas_creadas[area_nombre]
                    for cargo_nombre in cargos_lista:
                        cargo = Cargo.objects.create(
                            nombre=cargo_nombre,
                            area=area,
                            descripcion=f"Cargo de {cargo_nombre} en el área de {area_nombre}"
                        )
                        cargos_total += 1
                        print(f"  ✅ Cargo creado: {cargo_nombre} ({area_nombre})")
            
            print(f"\n🎉 ¡Carga completada exitosamente!")
            print(f"📊 Resumen:")
            print(f"  • Áreas creadas: {len(areas_creadas)}")
            print(f"  • Cargos creados: {cargos_total}")
            
            # Mostrar estadísticas por área
            print(f"\n📈 Estadísticas por área:")
            for area in Area.objects.all():
                total_cargos = area.cargos.count()
                print(f"  • {area.nombre}: {total_cargos} cargos")
                
    except Exception as e:
        print(f"❌ Error durante la carga: {str(e)}")
        return False
    
    return True

def verificar_datos():
    """Verifica que los datos se hayan cargado correctamente"""
    print("\n🔍 Verificando datos cargados...")
    
    total_areas = Area.objects.count()
    total_cargos = Cargo.objects.count()
    areas_activas = Area.objects.filter(is_active=True).count()
    cargos_activos = total_cargos  # Cargo no tiene is_active
    
    print(f"📊 Estado actual de la base de datos:")
    print(f"  • Total áreas: {total_areas} ({areas_activas} activas)")
    print(f"  • Total cargos: {total_cargos} ({cargos_activos} activos)")
    
    if total_areas == 0 or total_cargos == 0:
        print("⚠️  Parece que no hay datos. Ejecuta la función cargar_datos() primero.")
        return False
    
    # Mostrar algunas áreas con sus cargos
    print(f"\n📋 Ejemplo de áreas y cargos:")
    for area in Area.objects.prefetch_related('cargos')[:3]:
        print(f"  🏢 {area.nombre}")
        for cargo in area.cargos.all()[:3]:
            print(f"    👔 {cargo.nombre}")
        if area.cargos.count() > 3:
            print(f"    ... y {area.cargos.count() - 3} más")
    
    return True

def main():
    """Función principal"""
    print("=" * 60)
    print("🏢 CARGADOR DE ÁREAS Y CARGOS")
    print("=" * 60)
    
    # Cargar datos
    if cargar_datos():
        # Verificar datos
        verificar_datos()
        print(f"\n✅ ¡Proceso completado exitosamente!")
        print(f"💡 Ahora puedes usar el sistema con áreas y cargos cargados.")
    else:
        print(f"\n❌ El proceso falló. Revisa los errores anteriores.")
        sys.exit(1)

if __name__ == "__main__":
    main()
