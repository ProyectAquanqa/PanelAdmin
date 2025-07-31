# Implementation Plan - Refactorización de Separación de Lógica

## Fase 1: Estructura Base y Utilidades

- [x] 1. Crear estructura de carpetas y archivos de configuración

  - Crear carpetas vacías: src/config/, src/utils/, src/api/
  - Crear archivos de configuración base con exports vacíos
  - Configurar índices de exportación para cada carpeta
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 1.1 Implementar utilidades de ordenamiento y paginación

  - Crear src/utils/sortingUtils.js con funciones puras de ordenamiento
  - Crear src/utils/paginationUtils.js con lógica de paginación
  - Implementar tests unitarios para ambas utilidades
  - _Requirements: 1.2, 7.1, 7.2_

- [x] 1.2 Implementar utilidades de búsqueda y validación

  - Crear src/utils/searchUtils.js con funciones de normalización y filtrado
  - Crear src/utils/validationUtils.js con validadores reutilizables
  - Crear src/utils/formatUtils.js para formateo de datos

  - _Requirements: 4.2, 4.3, 7.1_

- [x] 1.3 Crear configuraciones de aplicación

  - Crear src/config/menuConfig.js con configuración de menús del sidebar
  - Crear src/config/breadcrumbConfig.js con mapeo de rutas a breadcrumbs
  - Crear src/config/appConfig.js con configuraciones generales
  - _Requirements: 3.1, 5.1, 9.1_

## Fase 2: Hooks Especializados

- [x] 2. Implementar hook useDataView para DataViewSwitcher


  - Crear src/hooks/useDataView.js que encapsule lógica de tabla
  - Migrar estado de ordenamiento, paginación y expansión de filas
  - Implementar funciones de manejo de estado con useCallback
  - Integrar utilidades de ordenamiento y paginación
  - _Requirements: 1.1, 6.1, 6.2_

- [x] 2.1 Implementar hooks para Header

  - Crear src/hooks/useBreadcrumbs.js para lógica de breadcrumbs
  - Crear src/hooks/useNotifications.js para manejo de notificaciones
  - Crear src/hooks/useTheme.js para toggle de tema oscuro/claro
  - Optimizar con useMemo y useCallback apropiadamente
  - _Requirements: 2.1, 2.2, 2.3, 6.2_

- [x] 2.2 Implementar hooks para Sidebar


  - Crear src/hooks/useSidebar.js para estado de colapso y hover
  - Crear src/hooks/useSidebarMenu.js para lógica de menús expandidos
  - Migrar lógica de navegación y detección de rutas activas
  - Integrar con configuración de menús
  - _Requirements: 3.2, 3.4, 6.1_

- [x] 2.3 Implementar hooks para KnowledgeBase

  - Crear src/hooks/useKnowledgeForm.js para manejo de formularios
  - Crear src/hooks/useSearch.js para lógica de búsqueda y filtros
  - Integrar utilidades de validación y búsqueda
  - Optimizar re-renders con memoización apropiada
  - _Requirements: 4.1, 6.1, 6.3_

## Fase 3: Refactorización de Componentes

- [-] 3. Refactorizar DataViewSwitcher (447 → <100 líneas) preservando diseño original

  - **ANTES DE REFACTORIZAR**: Documentar y capturar el diseño visual original completo
  - Crear src/components/Common/DataView/TableView.jsx manteniendo exactamente el mismo HTML y CSS
  - Crear src/components/Common/DataView/SortIcon.jsx preservando estilos y comportamiento visual
  - Crear src/components/Common/DataView/Pagination.jsx conservando diseño responsive original
  - Refactorizar DataViewSwitcher.jsx para usar hook useDataView SIN cambiar estructura visual
  - **DESPUÉS DE REFACTORIZAR**: Comparar pixel por pixel con la versión original
  - Mantener API externa exactamente igual
  - _Requirements: 1.3, 1.4, 1.5, 8.1, 10.1, 10.2, 10.3_

- [x] 3.1 Refactorizar Header (359 → <150 líneas) preservando diseño original

  - **ANTES DE REFACTORIZAR**: Comparar con Header original del proyecto sin refactorizar
  - Crear src/components/Header/NotificationDropdown.jsx manteniendo estilos y comportamiento original
  - Crear src/components/Header/UserMenu.jsx preservando diseño de dropdown y interacciones
  - Crear src/components/Header/SearchBar.jsx conservando estilos responsive originales
  - Crear src/components/Header/ThemeToggle.jsx manteniendo animaciones y estados visuales
  - Refactorizar Header.jsx para usar hooks especializados SIN cambiar estructura visual
  - **DESPUÉS DE REFACTORIZAR**: Verificar que breadcrumbs, notificaciones y tema se ven idénticos
  - _Requirements: 2.4, 2.5, 8.2, 10.1, 10.2, 10.3_

- [x] 3.2 Refactorizar Sidebar (368 → <200 líneas) preservando diseño original

  - **ANTES DE REFACTORIZAR**: Documentar diseño completo del Sidebar original
  - Integrar configuración de menús desde src/config/menuConfig.js manteniendo estructura visual
  - Refactorizar para usar hooks useSidebar y useSidebarMenu SIN cambiar comportamiento visual
  - Extraer lógica de navegación a utilidades preservando animaciones y transiciones
  - Mantener componentes modulares existentes en src/components/Sidebar/components/ con diseño original
  - **DESPUÉS DE REFACTORIZAR**: Verificar colapso, hover states y navegación idénticos al original
  - _Requirements: 3.3, 3.5, 8.2, 10.1, 10.2, 10.3_

- [x] 3.3 Refactorizar KnowledgeBase (332 → <150 líneas) preservando diseño original




  - **ANTES DE REFACTORIZAR**: Capturar diseño completo de cards de filtros y tabla original
  - Crear src/components/Chatbot/KnowledgeBase/KnowledgeModal.jsx manteniendo estilos de modal original
  - Crear src/components/Chatbot/KnowledgeBase/KnowledgeFilters.jsx preservando EXACTAMENTE el diseño de cards de filtros original
  - Refactorizar página principal para usar hooks especializados SIN perder elementos visuales
  - Separar lógica de formulario y validación manteniendo estructura HTML y CSS original
  - **DESPUÉS DE REFACTORIZAR**: Comparar tabla responsive y filtros con versión original sin refactorizar
  - _Requirements: 4.4, 4.5, 8.1, 10.1, 10.2, 10.3, 10.4_

## Fase 4: Componentes Auxiliares y Optimización

- [ ] 4. Crear componentes auxiliares reutilizables

  - Crear src/components/Common/Modal/Modal.jsx como modal base
  - Crear src/components/Common/Modal/ConfirmModal.jsx para confirmaciones
  - Optimizar componentes con React.memo donde sea apropiado
  - Implementar PropTypes para todos los componentes nuevos
  - _Requirements: 7.3, 9.4, 10.1_

- [ ] 4.1 Implementar configuración de API

  - Crear src/api/apiClient.js con cliente configurado
  - Crear src/api/interceptors.js para manejo de tokens y errores
  - Crear src/api/endpoints.js con definición centralizada de endpoints
  - Migrar configuraciones de authService y chatbotService
  - _Requirements: 5.4, 9.1_

- [ ] 4.2 Optimizar rendimiento y memoización
  - Revisar y optimizar uso de useMemo en hooks
  - Implementar useCallback para funciones pasadas como props
  - Aplicar React.memo a componentes que re-renderizan frecuentemente
  - Verificar que no hay re-renders innecesarios
  - _Requirements: 10.1, 10.2, 6.2_

## Fase 5: Testing y Validación

- [ ] 5. Implementar tests unitarios para utilidades

  - Crear tests para src/utils/sortingUtils.js
  - Crear tests para src/utils/paginationUtils.js
  - Crear tests para src/utils/searchUtils.js
  - Crear tests para src/utils/validationUtils.js
  - Asegurar 100% de cobertura en utilidades críticas
  - _Requirements: 7.5, 10.3_

- [ ] 5.1 Implementar tests para hooks

  - Crear tests para useDataView con React Testing Library
  - Crear tests para useBreadcrumbs, useNotifications, useTheme
  - Crear tests para useSidebar y useSidebarMenu
  - Crear tests para useKnowledgeForm y useSearch
  - _Requirements: 6.4, 10.3_

- [ ] 5.2 Validar funcionalidad completa
  - Ejecutar tests de regresión en todos los componentes refactorizados
  - Verificar que DataViewSwitcher mantiene toda su funcionalidad
  - Verificar que Header mantiene breadcrumbs, notificaciones y tema
  - Verificar que Sidebar mantiene navegación y estado de menús
  - Verificar que KnowledgeBase mantiene CRUD y filtros
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

## Fase 6: Documentación y Limpieza

- [ ] 6. Documentar código refactorizado

  - Agregar JSDoc a todas las utilidades en src/utils/
  - Agregar JSDoc a todos los hooks en src/hooks/
  - Documentar APIs de componentes refactorizados
  - Crear README.md para cada módulo principal
  - _Requirements: 5.5, 6.4_

- [ ] 6.1 Verificar cumplimiento de pautas

  - Verificar que ningún archivo excede 250 líneas
  - Verificar que se sigue principio de Separación de Lógica y UI
  - Verificar que se aplica principio DRY correctamente
  - Verificar que todos los componentes tienen PropTypes
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 6.2 Optimización final y cleanup
  - Remover código comentado y imports no utilizados
  - Verificar que todos los exports/imports están correctos
  - Ejecutar linter y corregir todos los warnings
  - Verificar que el bundle size no ha aumentado significativamente
  - _Requirements: 10.4, 10.5_

## Fase 7: Validación Final

- [ ] 7. Testing de integración completo

  - Probar flujo completo de DataViewSwitcher (ordenamiento, paginación, expansión)
  - Probar flujo completo de Header (breadcrumbs, notificaciones, tema, usuario)
  - Probar flujo completo de Sidebar (navegación, colapso, menús)
  - Probar flujo completo de KnowledgeBase (CRUD, búsqueda, filtros)
  - _Requirements: 8.5, 10.3_

- [ ] 7.1 Verificación de rendimiento

  - Medir tiempo de carga inicial antes y después
  - Verificar que no hay memory leaks en componentes refactorizados
  - Confirmar que re-renders son mínimos y apropiados
  - Validar que la experiencia de usuario es idéntica
  - _Requirements: 10.1, 10.2, 8.4_

- [ ] 7.2 Code review y aprobación final
  - Revisar que toda la lógica está apropiadamente separada
  - Confirmar que las pautas de desarrollo se siguen estrictamente
  - Verificar que la mantenibilidad ha mejorado significativamente
  - Aprobar que la refactorización está completa y lista para producción
  - _Requirements: 9.5, 10.4, 10.5_
