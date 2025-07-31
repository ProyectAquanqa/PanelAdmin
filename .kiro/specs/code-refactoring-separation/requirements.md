# Requirements Document - Refactorización de Separación de Lógica

## Introduction

Este spec define la refactorización crítica necesaria para cumplir con las pautas de desarrollo establecidas en `DEVELOPMENT_GUIDELINES.md`, específicamente el principio fundamental de "no tener toda la lógica en un solo archivo". El proyecto actualmente viola gravemente este principio con archivos de 300+ líneas que mezclan lógica de negocio con presentación.

## Requirements

### Requirement 1: Refactorizar DataViewSwitcher.jsx (447 líneas)

**User Story:** Como desarrollador, quiero que el componente DataViewSwitcher esté separado en múltiples archivos especializados, para que sea mantenible y reutilizable.

#### Acceptance Criteria

1. WHEN se refactoriza DataViewSwitcher.jsx THEN se debe crear un hook useDataView que maneje toda la lógica de estado
2. WHEN se separa la lógica THEN se deben crear utilidades independientes para ordenamiento y paginación en src/utils/
3. WHEN se modulariza el componente THEN se debe dividir en subcomponentes especializados (TableView, SortIcon, Pagination)
4. WHEN se completa la refactorización THEN el archivo principal no debe exceder 100 líneas
5. WHEN se implementa THEN se debe mantener la misma funcionalidad y API externa

### Requirement 2: Refactorizar Header.jsx (359 líneas)

**User Story:** Como desarrollador, quiero que el componente Header tenga responsabilidades separadas, para que sea fácil mantener y extender.

#### Acceptance Criteria

1. WHEN se refactoriza Header.jsx THEN la función getBreadcrumbs debe moverse a src/utils/breadcrumbUtils.js
2. WHEN se separa la lógica THEN se debe crear useNotifications hook para manejar el estado de notificaciones
3. WHEN se modulariza THEN se debe crear useTheme hook para el manejo del tema oscuro/claro
4. WHEN se divide THEN se deben crear subcomponentes: NotificationDropdown, UserMenu, SearchBar
5. WHEN se completa THEN el archivo principal no debe exceder 150 líneas

### Requirement 3: Refactorizar Sidebar.jsx (368 líneas)

**User Story:** Como desarrollador, quiero que el Sidebar tenga la configuración y lógica separadas, para facilitar el mantenimiento y la extensibilidad.

#### Acceptance Criteria

1. WHEN se refactoriza Sidebar.jsx THEN la configuración de menús debe moverse a src/config/menuConfig.js
2. WHEN se separa la lógica THEN se debe crear useSidebar hook para manejar el estado de colapso y navegación
3. WHEN se modulariza THEN se deben crear utilidades de navegación en src/utils/navigationUtils.js
4. WHEN se divide THEN se debe crear useSidebarMenu hook específico para la lógica de menús
5. WHEN se completa THEN el archivo principal no debe exceder 200 líneas

### Requirement 4: Refactorizar KnowledgeBase.jsx (332 líneas)

**User Story:** Como desarrollador, quiero que la página KnowledgeBase tenga la lógica de negocio separada de la presentación, para mejorar la mantenibilidad.

#### Acceptance Criteria

1. WHEN se refactoriza KnowledgeBase.jsx THEN se debe crear useKnowledgeForm hook para manejar formularios
2. WHEN se separa la lógica THEN se deben crear utilidades de búsqueda en src/utils/searchUtils.js
3. WHEN se modulariza THEN se deben crear utilidades de validación en src/utils/validationUtils.js
4. WHEN se divide THEN se deben crear subcomponentes: KnowledgeModal, KnowledgeFilters
5. WHEN se completa THEN el archivo principal no debe exceder 150 líneas

### Requirement 5: Poblar carpetas vacías con utilidades

**User Story:** Como desarrollador, quiero que las carpetas vacías contengan las utilidades y configuraciones apropiadas, para seguir la estructura de pautas establecida.

#### Acceptance Criteria

1. WHEN se puebla src/config/ THEN debe contener archivos de configuración de la aplicación
2. WHEN se puebla src/utils/ THEN debe contener utilidades reutilizables organizadas por funcionalidad
3. WHEN se puebla src/api/ THEN debe contener configuraciones y interceptores de API
4. WHEN se organiza THEN cada utilidad debe tener una responsabilidad única y clara
5. WHEN se implementa THEN todas las utilidades deben tener documentación JSDoc

### Requirement 6: Crear hooks especializados

**User Story:** Como desarrollador, quiero hooks especializados que encapsulen lógica específica, para seguir el principio de separación de responsabilidades.

#### Acceptance Criteria

1. WHEN se crean hooks THEN cada hook debe tener una responsabilidad única y bien definida
2. WHEN se implementa THEN los hooks deben usar useCallback y useMemo apropiadamente
3. WHEN se separa la lógica THEN los hooks deben ser reutilizables entre componentes
4. WHEN se documenta THEN cada hook debe tener JSDoc explicando su propósito y API
5. WHEN se prueba THEN los hooks deben mantener la funcionalidad existente

### Requirement 7: Implementar utilidades reutilizables

**User Story:** Como desarrollador, quiero utilidades puras y reutilizables que eliminen la duplicación de código, para seguir el principio DRY.

#### Acceptance Criteria

1. WHEN se crean utilidades THEN deben ser funciones puras sin efectos secundarios
2. WHEN se implementa THEN las utilidades deben ser completamente reutilizables
3. WHEN se organiza THEN las utilidades deben estar agrupadas por funcionalidad
4. WHEN se documenta THEN cada utilidad debe tener ejemplos de uso
5. WHEN se prueba THEN las utilidades deben tener casos de prueba unitarios

### Requirement 8: Mantener compatibilidad y funcionalidad

**User Story:** Como usuario final, quiero que todas las funcionalidades existentes sigan funcionando exactamente igual después de la refactorización.

#### Acceptance Criteria

1. WHEN se refactoriza THEN toda la funcionalidad existente debe mantenerse intacta
2. WHEN se separa la lógica THEN las APIs de los componentes no deben cambiar
3. WHEN se modulariza THEN el comportamiento visual debe ser idéntico
4. WHEN se completa THEN no debe haber regresiones en la funcionalidad
5. WHEN se prueba THEN todos los flujos de usuario deben funcionar correctamente

### Requirement 9: Seguir pautas de desarrollo estrictamente

**User Story:** Como desarrollador, quiero que la refactorización siga estrictamente las pautas establecidas en DEVELOPMENT_GUIDELINES.md.

#### Acceptance Criteria

1. WHEN se refactoriza THEN se debe seguir el principio de Separación de Lógica y UI
2. WHEN se implementa THEN se debe aplicar el principio DRY (Don't Repeat Yourself)
3. WHEN se desarrolla THEN se debe mantener el principio KISS (Keep It Simple, Stupid)
4. WHEN se documenta THEN todos los componentes deben tener PropTypes definidos
5. WHEN se completa THEN ningún archivo debe exceder 250 líneas de código

### Requirement 10: Preservar diseño visual y responsive original

**User Story:** Como usuario final, quiero que todos los elementos visuales, diseño responsive y estilos se mantengan exactamente iguales al proyecto original sin refactorizar.

#### Acceptance Criteria

1. WHEN se refactoriza THEN se debe conservar el diseño original completo de las tablas con su responsive
2. WHEN se separa la lógica THEN se deben mantener todos los cards de filtros con su diseño original
3. WHEN se modulariza THEN se debe preservar exactamente el layout, espaciado y estilos CSS originales
4. WHEN se implementa THEN se debe comparar pixel por pixel con la versión original sin refactorizar
5. WHEN se completa THEN no debe haber ninguna simplificación o pérdida de elementos visuales del diseño original

### Requirement 11: Optimizar rendimiento y mantenibilidad

**User Story:** Como desarrollador, quiero que la refactorización mejore el rendimiento y la mantenibilidad del código.

#### Acceptance Criteria

1. WHEN se refactoriza THEN se deben usar React.memo, useCallback y useMemo apropiadamente
2. WHEN se separa THEN se debe minimizar el re-renderizado innecesario de componentes
3. WHEN se modulariza THEN se debe facilitar el testing unitario de cada parte
4. WHEN se organiza THEN se debe mejorar la legibilidad y comprensión del código
5. WHEN se completa THEN se debe reducir el acoplamiento entre componentes