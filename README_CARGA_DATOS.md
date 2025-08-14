# 📊 Script de Carga de Áreas y Cargos

## 🎯 Propósito
Este script carga datos de ejemplo de áreas organizacionales y cargos para que el sistema funcione completamente.

## 📋 Requisitos
- Python 3.8+
- Django configurado
- Base de datos funcionando

## 🚀 Uso

### 1. Copiar el script al directorio del proyecto Django
```bash
# Copiar el archivo cargar_areas_cargos.py al directorio Aquanqa_noticias/
cp cargar_areas_cargos.py Aquanqa_noticias/
```

### 2. Ejecutar el script
```bash
cd Aquanqa_noticias/
python cargar_areas_cargos.py
```

### 3. Alternativa con manage.py
```bash
cd Aquanqa_noticias/
python manage.py shell < cargar_areas_cargos.py
```

## 📁 Áreas que se cargarán

| Área | Descripción | Cargos |
|------|-------------|--------|
| **Administración** | Gestión administrativa y financiera | 4 cargos |
| **Recursos Humanos** | Gestión del talento humano | 4 cargos |
| **Tecnología** | Desarrollo de software e IT | 7 cargos |
| **Ventas** | Gestión comercial | 4 cargos |
| **Marketing** | Marketing digital y comunicación | 5 cargos |
| **Operaciones** | Procesos operativos | 4 cargos |
| **Finanzas** | Contabilidad y análisis financiero | 4 cargos |

## 👔 Ejemplos de Cargos

### Tecnología
- CTO - Director de Tecnología
- Desarrollador Senior
- Desarrollador Junior
- Arquitecto de Software
- DevOps Engineer
- QA Tester
- Soporte Técnico

### Administración
- Gerente General
- Asistente Administrativo
- Coordinador Administrativo
- Secretaria Ejecutiva

### Recursos Humanos
- Gerente de RRHH
- Especialista en Reclutamiento
- Analista de Nómina
- Coordinador de Bienestar

## 🔍 Verificación

Después de ejecutar el script, puedes verificar los datos:

1. **En el admin de Django**: Ve a `/admin` y revisa las áreas y cargos
2. **En el frontend**: Los cargos aparecerán automáticamente en el formulario de crear usuario
3. **En el log**: El script mostrará un resumen de lo cargado

## 📊 Resultado Esperado

```
🎉 ¡Carga completada exitosamente!
📊 Resumen:
  • Áreas creadas: 7
  • Cargos creados: 32

📈 Estadísticas por área:
  • Administración: 4 cargos
  • Recursos Humanos: 4 cargos  
  • Tecnología: 7 cargos
  • Ventas: 4 cargos
  • Marketing: 5 cargos
  • Operaciones: 4 cargos
  • Finanzas: 4 cargos
```

## ⚠️ Notas Importantes

- **El script elimina datos existentes**: Si ya tienes áreas y cargos, serán reemplazados
- **Todas las áreas y cargos se crean como activos** (is_active=True)
- **Los cargos se asocian automáticamente** a sus áreas correspondientes
- **Los IDs se generan automáticamente** por Django

## 🔧 Personalización

Si quieres modificar los datos, edita las variables `areas_data` y `cargos_data` en el script:

```python
# Agregar nueva área
{
    'nombre': 'Mi Nueva Área',
    'descripcion': 'Descripción de mi área'
}

# Agregar cargos para esa área
'Mi Nueva Área': [
    'Cargo 1',
    'Cargo 2',
    'Cargo 3'
]
```

## 🐛 Troubleshooting

**Error "No module named django":**
```bash
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows
```

**Error de base de datos:**
```bash
python manage.py migrate
```

**Error de permisos:**
- Asegúrate de estar en el directorio correcto
- Verifica que tienes permisos de escritura en la base de datos

## ✅ ¡Listo!

Una vez ejecutado el script, tu sistema estará completamente funcional con áreas y cargos que los usuarios pueden usar al crear perfiles.
