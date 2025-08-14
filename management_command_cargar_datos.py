# Archivo: areas/management/commands/cargar_areas_cargos.py

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from areas.models import Area, Cargo

class Command(BaseCommand):
    help = 'Carga áreas y cargos de ejemplo en la base de datos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limpiar',
            action='store_true',
            help='Elimina datos existentes antes de cargar nuevos',
        )
        parser.add_argument(
            '--solo-verificar',
            action='store_true',
            help='Solo verifica los datos existentes sin cargar nada',
        )

    def handle(self, *args, **options):
        if options['solo_verificar']:
            self.verificar_datos()
            return

        self.stdout.write(
            self.style.SUCCESS('🚀 Iniciando carga de áreas y cargos...')
        )
        
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
                # Limpiar datos existentes si se solicita
                if options['limpiar']:
                    self.stdout.write("🗑️  Limpiando datos existentes...")
                    Cargo.objects.all().delete()
                    Area.objects.all().delete()
                
                # Crear áreas
                self.stdout.write("📁 Creando áreas...")
                areas_creadas = {}
                for area_data in areas_data:
                    area, created = Area.objects.get_or_create(
                        nombre=area_data['nombre'],
                        defaults={
                            'descripcion': area_data['descripcion'],
                            'is_active': True
                        }
                    )
                    areas_creadas[area.nombre] = area
                    if created:
                        self.stdout.write(f"  ✅ Área creada: {area.nombre}")
                    else:
                        self.stdout.write(f"  ⚠️  Área ya existía: {area.nombre}")
                
                # Crear cargos
                self.stdout.write("👔 Creando cargos...")
                cargos_total = 0
                cargos_creados = 0
                for area_nombre, cargos_lista in cargos_data.items():
                    if area_nombre in areas_creadas:
                        area = areas_creadas[area_nombre]
                        for cargo_nombre in cargos_lista:
                            cargo, created = Cargo.objects.get_or_create(
                                nombre=cargo_nombre,
                                area=area,
                                defaults={
                                    'descripcion': f"Cargo de {cargo_nombre} en el área de {area_nombre}",
                                    'is_active': True
                                }
                            )
                            cargos_total += 1
                            if created:
                                cargos_creados += 1
                                self.stdout.write(f"  ✅ Cargo creado: {cargo_nombre} ({area_nombre})")
                            else:
                                self.stdout.write(f"  ⚠️  Cargo ya existía: {cargo_nombre} ({area_nombre})")
                
                self.stdout.write(
                    self.style.SUCCESS(f"\n🎉 ¡Carga completada exitosamente!")
                )
                self.stdout.write(f"📊 Resumen:")
                self.stdout.write(f"  • Áreas procesadas: {len(areas_creadas)}")
                self.stdout.write(f"  • Cargos procesados: {cargos_total}")
                self.stdout.write(f"  • Cargos nuevos: {cargos_creados}")
                
                # Mostrar estadísticas por área
                self.stdout.write(f"\n📈 Estadísticas por área:")
                for area in Area.objects.all().order_by('nombre'):
                    total_cargos = area.cargos.count()
                    self.stdout.write(f"  • {area.nombre}: {total_cargos} cargos")
                    
        except Exception as e:
            raise CommandError(f'Error durante la carga: {str(e)}')
        
        # Verificar datos
        self.verificar_datos()

    def verificar_datos(self):
        """Verifica que los datos se hayan cargado correctamente"""
        self.stdout.write("\n🔍 Verificando datos cargados...")
        
        total_areas = Area.objects.count()
        total_cargos = Cargo.objects.count()
        areas_activas = Area.objects.filter(is_active=True).count()
        cargos_activos = Cargo.objects.filter(is_active=True).count()
        
        self.stdout.write(f"📊 Estado actual de la base de datos:")
        self.stdout.write(f"  • Total áreas: {total_areas} ({areas_activas} activas)")
        self.stdout.write(f"  • Total cargos: {total_cargos} ({cargos_activos} activos)")
        
        if total_areas == 0 or total_cargos == 0:
            self.stdout.write(
                self.style.WARNING("⚠️  No hay datos suficientes. Ejecuta el comando sin --solo-verificar para cargar datos.")
            )
            return
        
        # Mostrar algunas áreas con sus cargos
        self.stdout.write(f"\n📋 Ejemplo de áreas y cargos:")
        for area in Area.objects.prefetch_related('cargos').order_by('nombre')[:3]:
            self.stdout.write(f"  🏢 {area.nombre}")
            for cargo in area.cargos.all()[:3]:
                self.stdout.write(f"    👔 {cargo.nombre}")
            if area.cargos.count() > 3:
                self.stdout.write(f"    ... y {area.cargos.count() - 3} más")
        
        self.stdout.write(
            self.style.SUCCESS(f"\n✅ Datos verificados correctamente!")
        )
        self.stdout.write(
            f"💡 Los cargos están listos para usar en el sistema de usuarios."
        )
