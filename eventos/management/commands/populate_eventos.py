"""
Management command para poblar la base de datos con datos de eventos y categorías de prueba.
Uso: python manage.py populate_eventos
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

from eventos.models import Categoria, Evento

User = get_user_model()


class Command(BaseCommand):
    help = 'Pobla la base de datos con categorías y eventos de prueba'

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Eliminar todos los eventos y categorías existentes antes de crear nuevos',
        )
        parser.add_argument(
            '--events-count',
            type=int,
            default=15,
            help='Número de eventos a crear (por defecto: 15)',
        )

    def handle(self, *args, **options):
        if options['delete']:
            self.stdout.write('Eliminando eventos y categorías existentes...')
            Evento.objects.all().delete()
            Categoria.objects.all().delete()
            self.stdout.write(
                self.style.WARNING('✓ Todos los eventos y categorías han sido eliminados')
            )

        # Datos de categorías
        categorias_data = [
            {
                'nombre': 'Tecnología',
                'descripcion': 'Eventos relacionados con tecnología, innovación y desarrollo de software'
            },
            {
                'nombre': 'Educación',
                'descripcion': 'Conferencias, talleres y cursos educativos para la comunidad'
            },
            {
                'nombre': 'Deportes',
                'descripcion': 'Eventos deportivos, competencias y actividades físicas'
            },
            {
                'nombre': 'Cultura',
                'descripcion': 'Actividades culturales, exposiciones y festivales artísticos'
            },
            {
                'nombre': 'Negocios',
                'descripcion': 'Conferencias empresariales, networking y eventos corporativos'
            },
            {
                'nombre': 'Salud',
                'descripcion': 'Conferencias médicas, campañas de salud y bienestar'
            },
            {
                'nombre': 'Arte',
                'descripcion': 'Exposiciones artísticas, galerías y eventos creativos'
            },
            {
                'nombre': 'Música',
                'descripcion': 'Conciertos, festivales musicales y presentaciones artísticas'
            }
        ]

        # Obtener o crear usuario administrador
        try:
            admin_user = User.objects.filter(is_superuser=True).first()
            if not admin_user:
                admin_user = User.objects.filter(is_staff=True).first()
            if not admin_user:
                admin_user = User.objects.first()
            
            if not admin_user:
                self.stdout.write(
                    self.style.ERROR('Error: No se encontró ningún usuario. Crea un superusuario primero.')
                )
                return
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error al obtener usuario: {e}')
            )
            return

        # Crear categorías
        self.stdout.write('Creando categorías...')
        categorias_creadas = []
        
        for cat_data in categorias_data:
            categoria, created = Categoria.objects.get_or_create(
                nombre=cat_data['nombre'],
                defaults={
                    'descripcion': cat_data['descripcion'],
                    'created_by': admin_user,
                    'updated_by': admin_user,
                }
            )
            categorias_creadas.append(categoria)
            status = "✓ Creada" if created else "→ Ya existe"
            self.stdout.write(f'  {status}: {categoria.nombre}')

        # Datos de eventos
        eventos_data = [
            {
                'titulo': 'Conferencia de Inteligencia Artificial 2024',
                'descripcion': 'Un evento dedicado a las últimas tendencias en IA, machine learning y deep learning. Expertos de todo el mundo compartirán sus conocimientos y experiencias en esta conferencia magistral.',
                'categoria': 'Tecnología',
                'publicado': True,
                'is_pinned': True,
                'dias_futuro': 45
            },
            {
                'titulo': 'Taller de Desarrollo Web Moderno',
                'descripcion': 'Aprende las últimas tecnologías de desarrollo web: React, Vue, Node.js y más. Incluye prácticas hands-on y proyectos reales para consolidar el aprendizaje.',
                'categoria': 'Tecnología',
                'publicado': True,
                'is_pinned': False,
                'dias_futuro': 50
            },
            {
                'titulo': 'Seminario de Metodologías Educativas',
                'descripcion': 'Nuevas estrategias pedagógicas para el siglo XXI. Dirigido a docentes y profesionales de la educación que buscan innovar en sus prácticas.',
                'categoria': 'Educación',
                'publicado': True,
                'is_pinned': False,
                'dias_futuro': 55
            },
            {
                'titulo': 'Copa Universitaria de Fútbol',
                'descripcion': 'Torneo anual entre universidades. Participan 16 equipos de toda la región en una competencia emocionante que durará tres semanas.',
                'categoria': 'Deportes',
                'publicado': True,
                'is_pinned': True,
                'dias_futuro': 65
            },
            {
                'titulo': 'Festival de Arte Contemporáneo',
                'descripcion': 'Exposición de artistas locales e internacionales. Incluye pintura, escultura, instalaciones y arte digital en una muestra sin precedentes.',
                'categoria': 'Arte',
                'publicado': False,
                'is_pinned': False,
                'dias_futuro': 70
            },
            {
                'titulo': 'Congreso de Emprendimiento Digital',
                'descripcion': 'Startups, inversión, marketing digital y estrategias de negocio para el mundo digital actual. Conecta con inversores y otros emprendedores.',
                'categoria': 'Negocios',
                'publicado': True,
                'is_pinned': False,
                'dias_futuro': 75
            },
            {
                'titulo': 'Simposio de Salud Mental',
                'descripcion': 'Profesionales de la salud mental comparten las últimas investigaciones y tratamientos. Dirigido a psicólogos, psiquiatras y trabajadores sociales.',
                'categoria': 'Salud',
                'publicado': True,
                'is_pinned': False,
                'dias_futuro': 80
            },
            {
                'titulo': 'Concierto de Música Clásica',
                'descripcion': 'La Orquesta Sinfónica Nacional presenta un repertorio de obras maestras clásicas en una velada inolvidable en el Teatro Principal.',
                'categoria': 'Música',
                'publicado': True,
                'is_pinned': True,
                'dias_futuro': 85
            },
            {
                'titulo': 'Workshop de Fotografía Digital',
                'descripcion': 'Técnicas avanzadas de fotografía digital, edición y composición. Para fotógrafos principiantes y experimentados que quieren mejorar sus habilidades.',
                'categoria': 'Arte',
                'publicado': False,
                'is_pinned': False,
                'dias_futuro': 90
            },
            {
                'titulo': 'Maratón de la Ciudad',
                'descripcion': 'Evento deportivo anual que recorre los principales puntos turísticos de la ciudad. Categorías: 5k, 10k, 21k y 42k para todos los niveles.',
                'categoria': 'Deportes',
                'publicado': True,
                'is_pinned': False,
                'dias_futuro': 95
            },
            {
                'titulo': 'Cumbre de Liderazgo Femenino',
                'descripcion': 'Mujeres líderes en diferentes industrias comparten sus experiencias y estrategias para el éxito profesional en un ambiente inspirador.',
                'categoria': 'Negocios',
                'publicado': True,
                'is_pinned': True,
                'dias_futuro': 100
            },
            {
                'titulo': 'Festival Gastronómico Internacional',
                'descripcion': 'Chefs de diferentes países presentan sus especialidades culinarias en un evento lleno de sabores únicos y experiencias gastronómicas.',
                'categoria': 'Cultura',
                'publicado': False,
                'is_pinned': False,
                'dias_futuro': 105
            },
            {
                'titulo': 'Hackathon de Innovación Social',
                'descripcion': 'Desarrolladores, diseñadores y emprendedores se unen para crear soluciones tecnológicas a problemas sociales en 48 horas intensas.',
                'categoria': 'Tecnología',
                'publicado': True,
                'is_pinned': False,
                'dias_futuro': 110
            },
            {
                'titulo': 'Congreso de Medicina Preventiva',
                'descripcion': 'Últimos avances en medicina preventiva y salud pública. Dirigido a profesionales de la salud interesados en la prevención de enfermedades.',
                'categoria': 'Salud',
                'publicado': True,
                'is_pinned': False,
                'dias_futuro': 115
            },
            {
                'titulo': 'Feria del Libro y la Literatura',
                'descripcion': 'Escritores, editoriales y amantes de la literatura se reúnen en una celebración de las letras con presentaciones, talleres y firmas de libros.',
                'categoria': 'Cultura',
                'publicado': True,
                'is_pinned': False,
                'dias_futuro': 120
            }
        ]

        # Crear eventos
        self.stdout.write(f'Creando {len(eventos_data)} eventos...')
        eventos_creados = 0
        
        for evento_data in eventos_data[:options['events_count']]:
            # Buscar la categoría
            categoria = next(
                (cat for cat in categorias_creadas if cat.nombre == evento_data['categoria']), 
                None
            )
            
            # Calcular fecha futura
            fecha = timezone.now() + timedelta(days=evento_data['dias_futuro'])
            
            evento, created = Evento.objects.get_or_create(
                titulo=evento_data['titulo'],
                defaults={
                    'descripcion': evento_data['descripcion'],
                    'fecha': fecha,
                    'publicado': evento_data['publicado'],
                    'is_pinned': evento_data['is_pinned'],
                    'autor': admin_user,
                    'categoria': categoria,
                    'created_by': admin_user,
                    'updated_by': admin_user,
                }
            )
            
            if created:
                eventos_creados += 1
                status_pub = "📌 Fijado" if evento.is_pinned else ("✅ Publicado" if evento.publicado else "📝 Borrador")
                self.stdout.write(f'  ✓ {evento.titulo} - {categoria.nombre if categoria else "Sin categoría"} - {status_pub}')

        # Resumen
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🎉 POBLACIÓN COMPLETADA'))
        self.stdout.write(self.style.SUCCESS(f'✓ {len(categorias_creadas)} categorías en total'))
        self.stdout.write(self.style.SUCCESS(f'✓ {eventos_creados} eventos nuevos creados'))
        self.stdout.write(self.style.SUCCESS(f'✓ Usuario administrador: {admin_user.email if admin_user.email else admin_user.username}'))
        
        # Estadísticas
        total_eventos = Evento.objects.count()
        eventos_publicados = Evento.objects.filter(publicado=True).count()
        eventos_fijados = Evento.objects.filter(is_pinned=True).count()
        
        self.stdout.write('')
        self.stdout.write('📊 ESTADÍSTICAS FINALES:')
        self.stdout.write(f'   • Total eventos: {total_eventos}')
        self.stdout.write(f'   • Eventos publicados: {eventos_publicados}')
        self.stdout.write(f'   • Eventos fijados: {eventos_fijados}')
        self.stdout.write(f'   • Total categorías: {Categoria.objects.count()}')
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🚀 ¡La base de datos está lista! Puedes ver los eventos en tu panel de administración.'))