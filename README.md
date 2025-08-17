# 🛡️ AquanQ - Panel Administrativo

Panel de administración moderno desarrollado en React para la gestión integral del ecosistema AquanQ. Interfaz de usuario elegante y funcional para administradores y usuarios con permisos específicos.

##  Características Principales

###  **Gestión de Usuarios**
- **Usuarios**: CRUD completo con validación avanzada
- **Perfiles/Grupos**: Sistema de permisos granulares
- **Áreas**: Organización departamental
- **Cargos**: Roles específicos por área

### **Gestión de Eventos**
- **Eventos**: Creación y administración de eventos
- **Categorías**: Clasificación y organización
- **Comentarios**: Moderación y gestión
- **Likes**: Sistema de interacciones

### **Chatbot Inteligente**
- **Base de Conocimiento**: Gestión de contenido del chatbot
- **Categorías**: Organización temática
- **Conversaciones**: Monitoreo y análisis
- **Dashboard**: Estadísticas y métricas

###  **Notificaciones**
- **Gestión de Notificaciones**: Envío masivo y personalizado
- **Dispositivos**: Administración de tokens FCM
- **Historial**: Seguimiento de notificaciones enviadas

###  **Sistema de Almuerzos**
- **Gestión de Menús**: Administración de opciones diarias
- **Reservas**: Control de solicitudes de usuarios

### **Sistema de Seguridad**
- **Autenticación JWT**: Sistema seguro de tokens
- **Permisos Granulares**: Control de acceso por módulo y acción
- **Validación en Tiempo Real**: Verificación de permisos dinámicos

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **React 18.3.1** - Framework principal
- **React Router Dom 7.6.2** - Navegación SPA
- **Tailwind CSS 3.4.17** - Framework de estilos
- **Framer Motion 12.23.7** - Animaciones fluidas
- **React Hot Toast 2.5.2** - Notificaciones elegantes

### **Comunicación**
- **Axios 1.11.0** - Cliente HTTP
- **JWT Decode 4.0.0** - Manejo de tokens

### **Utilidades**
- **XLSX** - Exportación de datos
- **File Saver 2.0.5** - Descarga de archivos
- **Heroicons React 2.2.0** - Iconografía
- **Simplebar React 3.3.2** - Scrollbars personalizados

### **Desarrollo**
- **Vite 6.3.5** - Build tool moderna
- **ESLint 9.25.0** - Linting de código
- **PostCSS 8.5.6** - Procesamiento CSS
- **Autoprefixer 10.4.21** - Compatibilidad CSS

## Estructura del Proyecto

```
PanelAdmin/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Almuerzos/      # Gestión de almuerzos
│   │   ├── Areas/          # Administración de áreas
│   │   ├── Auth/           # Autenticación
│   │   ├── Cargos/         # Gestión de cargos
│   │   ├── Chatbot/        # Sistema de chatbot
│   │   ├── Common/         # Componentes comunes
│   │   ├── Dashboard/      # Panel principal
│   │   ├── Devices/        # Gestión de dispositivos
│   │   ├── Eventos/        # Administración de eventos
│   │   ├── Header/         # Cabecera de la aplicación
│   │   ├── Layout/         # Layouts principales
│   │   ├── Notifications/  # Sistema de notificaciones
│   │   ├── Perfiles/       # Gestión de perfiles
│   │   ├── Sidebar/        # Barra lateral
│   │   └── Users/          # Administración de usuarios
│   ├── hooks/              # Hooks personalizados
│   ├── pages/              # Páginas principales
│   ├── services/           # Servicios de API
│   ├── utils/              # Utilidades generales
│   ├── config/             # Configuraciones
│   ├── constants/          # Constantes globales
│   ├── context/            # Contextos de React
│   └── routes/             # Configuración de rutas
├── public/                 # Archivos estáticos
└── dist/                   # Build de producción
```

## Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Backend Django AquanQ funcionando

### **Instalación**
```bash
# Clonar el repositorio
git clone [repository-url]

# Navegar al directorio
cd PanelAdmin

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar en desarrollo
npm run dev
```

### **Variables de Entorno**
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=AquanQ Panel Admin
VITE_APP_VERSION=1.0.0
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev                 # Servidor de desarrollo
npm run dev:api            # Desarrollo con API específica

# Producción
npm run build              # Build para producción
npm run preview            # Preview del build

# Calidad de código
npm run lint               # Linting con ESLint
```

## Sistema de Permisos

### **Niveles de Acceso**
1. **SUPERUSER** - Acceso completo sin restricciones
2. **ADMIN** - Usuarios administrativos con permisos amplios
3. **LIMITED** - Usuarios con permisos específicos limitados
4. **WORKER** - Usuarios básicos con acceso restringido

### **Permisos Granulares**
- **View** - Visualizar información
- **Add** - Crear nuevos registros
- **Change** - Editar registros existentes
- **Delete** - Eliminar registros

### **Módulos Protegidos**
- Usuarios y permisos
- Gestión de eventos
- Sistema de chatbot
- Notificaciones
- Configuraciones del sistema

## Características Técnicas

### **Arquitectura**
- **SPA (Single Page Application)** con React Router
- **Estado Global** con Context API
- **Hooks Personalizados** para lógica reutilizable
- **Componentes Funcionales** con Hooks
- **Lazy Loading** para optimización

### **Optimizaciones**
- **Code Splitting** automático con Vite
- **Tree Shaking** para bundle size óptimo
- **Memoización** de componentes críticos
- **Debounced Search** en filtros
- **Paginación** inteligente

### **Responsive Design**
- **Mobile First** approach
- **Breakpoints** optimizados
- **Touch Gestures** en dispositivos móviles
- **Progressive Web App** ready

## API y Servicios

### **Servicios Principales**
- `authService` - Autenticación y autorización
- `userService` - Gestión de usuarios
- `eventosService` - Administración de eventos
- `chatbotService` - Sistema de chatbot
- `notificationsService` - Notificaciones
- `areasService` - Gestión de áreas
- `groupService` - Perfiles y permisos

### **Interceptores HTTP**
- **Token Refresh** automático
- **Error Handling** centralizado
- **Loading States** globales
- **Request/Response** logging

##  UI/UX

### **Diseño**
- **Tailwind CSS** para estilos consistentes
- **Dark/Light Mode** (en desarrollo)
- **Animaciones** fluidas con Framer Motion
- **Tipografía** optimizada para legibilidad

### **Componentes**
- **Modales** reutilizables
- **Formularios** con validación
- **Tablas** interactivas
- **Cards** informativos
- **Filtros** dinámicos

## Testing y Calidad

### **Herramientas**
- **ESLint** - Linting de código
- **PropTypes** - Validación de props
- **React DevTools** - Debugging

### **Buenas Prácticas**
- **Nomenclatura** consistente
- **Comentarios** descriptivos
- **Separación** de responsabilidades
- **Reutilización** de código

## Performance

### **Métricas Objetivo**
- **First Contentful Paint** < 2s
- **Largest Contentful Paint** < 3s
- **Bundle Size** < 500kb gzipped
- **Lighthouse Score** > 90

### **Optimizaciones Implementadas**
- **Lazy Loading** de rutas
- **Memoización** de componentes
- **Virtual Scrolling** en tablas grandes
- **Image Optimization** automática

## Deployment

### **Build de Producción**
```bash
# Generar build optimizado
npm run build

# Verificar build localmente
npm run preview
```

### **Estructura del Build**
```
dist/
├── assets/           # Assets optimizados
├── index.html       # HTML principal
└── vite.manifest.json # Manifest del build
```

##  Desarrollo

### **Convenciones de Código**
- **ES6+** features
- **Arrow Functions** preferidas
- **Destructuring** cuando sea posible
- **Template Literals** para strings

### **Estructura de Componentes**
```jsx
// Imports
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Component
const MyComponent = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // Handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// PropTypes
MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

// Export
export default MyComponent;
```

