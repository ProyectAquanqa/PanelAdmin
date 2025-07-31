# Design Document - Refactorización de Separación de Lógica

## Overview

Este diseño define la arquitectura y estructura para refactorizar los archivos críticos que violan el principio de separación de lógica. La refactorización seguirá un enfoque modular donde cada archivo tendrá una responsabilidad única y clara, cumpliendo estrictamente con las pautas de desarrollo establecidas.

## Architecture

### Principios de Diseño

1. **Single Responsibility Principle**: Cada archivo/función tiene una sola responsabilidad
2. **Separation of Concerns**: Lógica de negocio separada de presentación
3. **DRY (Don't Repeat Yourself)**: Utilidades reutilizables para eliminar duplicación
4. **KISS (Keep It Simple, Stupid)**: Soluciones simples y directas
5. **Modular Design**: Componentes pequeños y especializados
6. **Design Preservation**: Mantener exactamente el diseño visual y responsive original
7. **Visual Consistency**: Preservar todos los elementos visuales, espaciado y estilos CSS

### Estructura de Archivos Objetivo

```
src/
├── api/
│   ├── apiClient.js              # Cliente API configurado
│   ├── interceptors.js           # Interceptores de request/response
│   └── endpoints.js              # Definición de endpoints
├── config/
│   ├── menuConfig.js             # Configuración de menús del sidebar
│   ├── appConfig.js              # Configuración general de la app
│   ├── themeConfig.js            # Configuración de temas
│   └── breadcrumbConfig.js       # Configuración de breadcrumbs
├── utils/
│   ├── sortingUtils.js           # Utilidades de ordenamiento
│   ├── paginationUtils.js        # Utilidades de paginación
│   ├── searchUtils.js            # Utilidades de búsqueda
│   ├── validationUtils.js        # Utilidades de validación
│   ├── breadcrumbUtils.js        # Utilidades de breadcrumbs
│   ├── navigationUtils.js        # Utilidades de navegación
│   ├── dateUtils.js              # Utilidades de fechas
│   └── formatUtils.js            # Utilidades de formateo
├── hooks/
│   ├── useDataView.js            # Hook para DataViewSwitcher
│   ├── useNotifications.js       # Hook para notificaciones
│   ├── useTheme.js               # Hook para manejo de tema
│   ├── useSidebar.js             # Hook para sidebar
│   ├── useSidebarMenu.js         # Hook para menús del sidebar
│   ├── useKnowledgeForm.js       # Hook para formularios de knowledge
│   ├── useBreadcrumbs.js         # Hook para breadcrumbs
│   └── useSearch.js              # Hook para búsqueda
└── components/
    ├── Common/
    │   ├── DataView/
    │   │   ├── DataViewSwitcher.jsx    # Componente principal (< 100 líneas)
    │   │   ├── TableView.jsx           # Vista de tabla
    │   │   ├── SortIcon.jsx            # Icono de ordenamiento
    │   │   ├── Pagination.jsx          # Componente de paginación
    │   │   └── index.js                # Exportaciones
    │   └── Modal/
    │       ├── Modal.jsx               # Modal base reutilizable
    │       └── ConfirmModal.jsx        # Modal de confirmación
    ├── Header/
    │   ├── Header.jsx                  # Componente principal (< 150 líneas)
    │   ├── NotificationDropdown.jsx    # Dropdown de notificaciones
    │   ├── UserMenu.jsx                # Menú de usuario
    │   ├── SearchBar.jsx               # Barra de búsqueda
    │   └── ThemeToggle.jsx             # Toggle de tema
    ├── Sidebar/
    │   ├── Sidebar.jsx                 # Componente principal (< 200 líneas)
    │   └── components/                 # Componentes existentes
    └── Chatbot/
        └── KnowledgeBase/
            ├── KnowledgeBase.jsx       # Página principal (< 150 líneas)
            ├── KnowledgeModal.jsx      # Modal de crear/editar
            ├── KnowledgeFilters.jsx    # Filtros de búsqueda
            └── components/             # Componentes existentes
```

## Components and Interfaces

### 1. DataViewSwitcher Refactorization

#### useDataView Hook
```javascript
// src/hooks/useDataView.js
export const useDataView = (data, options = {}) => {
  // Estados de ordenamiento, paginación, expansión
  // Funciones de manejo de estado
  // Datos procesados y filtrados
  return {
    sortedData,
    paginatedData,
    pagination,
    sorting,
    expandedRows,
    handleSort,
    handlePageChange,
    toggleRowExpansion
  };
};
```

#### Utilidades de Ordenamiento
```javascript
// src/utils/sortingUtils.js
export const sortData = (data, field, direction) => { /* ... */ };
export const getSortIcon = (field, currentField, direction) => { /* ... */ };
export const getNextSortDirection = (current) => { /* ... */ };
```

#### Utilidades de Paginación
```javascript
// src/utils/paginationUtils.js
export const calculatePagination = (totalItems, itemsPerPage, currentPage) => { /* ... */ };
export const getPaginatedData = (data, pagination) => { /* ... */ };
export const generatePageNumbers = (totalPages, currentPage) => { /* ... */ };
```

### 2. Header Refactorization

#### useBreadcrumbs Hook
```javascript
// src/hooks/useBreadcrumbs.js
export const useBreadcrumbs = () => {
  const location = useLocation();
  const breadcrumbs = useMemo(() => 
    getBreadcrumbsFromPath(location.pathname), [location.pathname]
  );
  return breadcrumbs;
};
```

#### useNotifications Hook
```javascript
// src/hooks/useNotifications.js
export const useNotifications = () => {
  // Estado de notificaciones
  // Funciones de manejo
  return {
    notifications,
    unreadCount,
    showNotifications,
    toggleNotifications,
    markAsRead
  };
};
```

#### useTheme Hook
```javascript
// src/hooks/useTheme.js
export const useTheme = () => {
  // Estado del tema
  // Funciones de cambio de tema
  return {
    isDarkMode,
    toggleTheme,
    setTheme
  };
};
```

#### Utilidades de Breadcrumbs
```javascript
// src/utils/breadcrumbUtils.js
export const getBreadcrumbsFromPath = (pathname) => {
  // Lógica de mapeo de rutas a breadcrumbs
  return { section, subsection };
};

export const breadcrumbRoutes = {
  '/chatbot/knowledge': { section: 'Chatbot', subsection: 'Base de Conocimiento' },
  // ... más rutas
};
```

### 3. Sidebar Refactorization

#### Configuración de Menús
```javascript
// src/config/menuConfig.js
export const menuItems = [
  {
    title: 'Dashboard',
    icon: HomeIcon,
    path: '/',
  }
];

export const eventosItems = [
  {
    title: 'Eventos',
    icon: CalendarIcon,
    path: '/eventos',
    submenu: [
      { title: 'Gestión de Eventos', path: '/eventos/gestion' },
      // ... más items
    ]
  }
];

// ... más configuraciones de menú
```

#### useSidebar Hook
```javascript
// src/hooks/useSidebar.js
export const useSidebar = () => {
  // Estado de colapso, hover, etc.
  // Funciones de manejo
  return {
    isCollapsed,
    isHovered,
    shouldExpand,
    toggleSidebar,
    setIsHovered
  };
};
```

#### useSidebarMenu Hook
```javascript
// src/hooks/useSidebarMenu.js
export const useSidebarMenu = () => {
  // Estado de menús expandidos
  // Lógica de navegación
  return {
    expandedMenus,
    lastClickedMenu,
    lastSelectedSubmenu,
    toggleSubmenu,
    handleSubmenuItemSelect
  };
};
```

### 4. KnowledgeBase Refactorization

#### useKnowledgeForm Hook
```javascript
// src/hooks/useKnowledgeForm.js
export const useKnowledgeForm = (initialData = {}) => {
  // Estado del formulario
  // Validaciones
  // Funciones de manejo
  return {
    formData,
    errors,
    isValid,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData
  };
};
```

#### useSearch Hook
```javascript
// src/hooks/useSearch.js
export const useSearch = (data, searchFields) => {
  // Estado de búsqueda
  // Lógica de filtrado
  return {
    searchTerm,
    filteredData,
    setSearchTerm,
    clearSearch
  };
};
```

#### Utilidades de Búsqueda
```javascript
// src/utils/searchUtils.js
export const normalizeText = (text) => { /* ... */ };
export const searchInFields = (item, searchTerm, fields) => { /* ... */ };
export const filterByCategory = (data, categoryId) => { /* ... */ };
export const filterByEmbedding = (data, embeddingFilter) => { /* ... */ };
```

#### Utilidades de Validación
```javascript
// src/utils/validationUtils.js
export const validateRequired = (value, fieldName) => { /* ... */ };
export const validateEmail = (email) => { /* ... */ };
export const validateKnowledgeForm = (formData) => { /* ... */ };
export const getValidationErrors = (data, rules) => { /* ... */ };
```

## Data Models

### Hook Return Types
```typescript
interface DataViewState {
  sortedData: any[];
  paginatedData: any[];
  pagination: PaginationState;
  sorting: SortingState;
  expandedRows: Set<string>;
  handleSort: (field: string) => void;
  handlePageChange: (page: number) => void;
  toggleRowExpansion: (id: string) => void;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  showNotifications: boolean;
  toggleNotifications: () => void;
  markAsRead: (id: string) => void;
}

interface SidebarState {
  isCollapsed: boolean;
  isHovered: boolean;
  shouldExpand: boolean;
  toggleSidebar: () => void;
  setIsHovered: (hovered: boolean) => void;
}
```

### Configuration Types
```typescript
interface MenuItem {
  title: string;
  icon: React.ComponentType;
  path: string;
  submenu?: SubMenuItem[];
}

interface BreadcrumbConfig {
  section: string;
  subsection?: string;
}
```

## Error Handling

### Validation Error Handling
- Utilidades de validación retornan objetos de error estructurados
- Hooks manejan errores de forma consistente
- Componentes muestran errores de manera uniforme

### Hook Error Boundaries
- Cada hook maneja sus propios errores internos
- Errores críticos se propagan al componente padre
- Logging consistente de errores para debugging

## Testing Strategy

### Unit Testing
- Cada utilidad tendrá tests unitarios completos
- Hooks serán probados con React Testing Library
- Componentes refactorizados mantendrán coverage existente

### Integration Testing
- Tests de integración para flujos completos
- Verificación de que la refactorización no rompe funcionalidad
- Tests de regresión para componentes críticos

### Testing Structure
```
src/
├── utils/
│   └── __tests__/
│       ├── sortingUtils.test.js
│       ├── paginationUtils.test.js
│       └── searchUtils.test.js
├── hooks/
│   └── __tests__/
│       ├── useDataView.test.js
│       ├── useNotifications.test.js
│       └── useSidebar.test.js
└── components/
    └── __tests__/
        └── [component].test.jsx
```

## Performance Considerations

### Memoization Strategy
- `useMemo` para cálculos costosos (ordenamiento, filtrado)
- `useCallback` para funciones pasadas como props
- `React.memo` para componentes que re-renderizan frecuentemente

### Code Splitting
- Lazy loading de componentes pesados
- Dynamic imports para utilidades grandes
- Chunk optimization para mejor carga inicial

### Bundle Size Optimization
- Tree shaking de utilidades no utilizadas
- Imports específicos en lugar de imports completos
- Análisis de bundle size post-refactorización

## Migration Strategy

### Phase 1: Utilities and Configuration
1. Crear estructura de carpetas
2. Implementar utilidades básicas
3. Crear archivos de configuración
4. Migrar constantes y datos estáticos

### Phase 2: Hooks Implementation
1. Implementar hooks especializados
2. Migrar lógica de componentes a hooks
3. Testing de hooks individuales
4. Integración gradual en componentes

### Phase 3: Component Refactoring
1. Refactorizar DataViewSwitcher
2. Refactorizar Header
3. Refactorizar Sidebar
4. Refactorizar KnowledgeBase

### Phase 4: Integration and Testing
1. Testing de integración completo
2. Verificación de funcionalidad
3. Performance testing
4. Code review y optimización

## Design Preservation Strategy

### Visual Design Preservation
- **Pixel-Perfect Comparison**: Comparar cada componente refactorizado con la versión original sin refactorizar
- **CSS Class Preservation**: Mantener exactamente las mismas clases CSS y estructura HTML
- **Responsive Behavior**: Preservar completamente el comportamiento responsive original
- **Layout Structure**: Conservar la estructura de layout, espaciado y márgenes originales

### Component Visual Integrity
- **Table Design**: Mantener el diseño completo de tablas con su responsive original
- **Filter Cards**: Preservar todos los cards de filtros con su diseño visual original
- **Modal Styling**: Conservar el estilo y comportamiento de modales exactamente igual
- **Button Styles**: Mantener todos los estilos de botones, hover states y interacciones

### Reference Implementation Strategy
- **Original Codebase Reference**: Usar el proyecto original (C:\Users\Admin\Documents\GitHub\PanelAdmin_real) como referencia visual
- **Side-by-Side Comparison**: Comparar componente por componente durante la refactorización
- **Visual Testing**: Implementar tests visuales para detectar cambios no deseados
- **Design Documentation**: Documentar todos los elementos visuales que deben preservarse

### CSS and Styling Approach
- **No Style Simplification**: Prohibir cualquier simplificación de estilos durante la refactorización
- **Complete Style Migration**: Migrar todos los estilos CSS sin modificaciones
- **Responsive Breakpoints**: Mantener todos los breakpoints responsive originales
- **Animation Preservation**: Conservar todas las animaciones y transiciones originales

## Backward Compatibility

### API Preservation
- Mantener interfaces públicas de componentes
- Props y callbacks existentes sin cambios
- Comportamiento visual idéntico

### Gradual Migration
- Refactorización incremental por componente
- Feature flags para rollback si es necesario
- Testing exhaustivo en cada paso

## Documentation

### Code Documentation
- JSDoc para todas las utilidades y hooks
- Comentarios inline para lógica compleja
- README para cada módulo principal

### Migration Guide
- Guía paso a paso de la refactorización
- Ejemplos de antes y después
- Troubleshooting común

### Architecture Decision Records
- Documentar decisiones de diseño importantes
- Rationale para estructura elegida
- Trade-offs considerados