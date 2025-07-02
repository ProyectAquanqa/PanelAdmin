# Plan de Desarrollo Integral: Dashboard Hospitalario Multifuncional

Este documento presenta una hoja de ruta técnica y detallada para el desarrollo del `hospital_dashboard`. El sistema funciona como una herramienta dual: un **panel de administración** que consume la API de Django (`hospital_admin`) y un **portal operacional** que consume la API de Spring Boot (`hospital_main`) para la gestión completa del centro médico.

## Fase 1: Arquitectura Multi-API y Fundamentos

### 1.1 Configuración Base
- **Variables de Entorno**:
  ```
  VITE_ADMIN_API_BASE_URL=http://localhost:8000/api
  VITE_MAIN_API_BASE_URL=http://localhost:8080/api
  ```

- **Clientes API Especializados**:
  - `src/api/adminApiClient.js` (Django)
  - `src/api/mainApiClient.js` (Spring Boot)
  - Cada uno con sus propios interceptores para manejo de tokens y errores

### 1.2 Estructura de Proyecto Optimizada
```
src/
├── api/
│   ├── adminApiClient.js
│   └── mainApiClient.js
├── components/
│   ├── auth/
│   ├── layout/
│   ├── common/
│   └── [módulos específicos]
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── hooks/
│   └── [hooks específicos por módulo]
├── pages/
│   └── [páginas por módulo]
├── services/
│   ├── admin/
│   │   └── [servicios para Django]
│   └── main/
│       └── [servicios para Spring Boot]
└── utils/
```

### 1.3 Dependencias Clave
```bash
# Core y Routing
npm install react react-dom react-router-dom

# Estado y Fetching
npm install @tanstack/react-query @tanstack/react-table axios

# Formularios y Validación
npm install react-hook-form @hookform/resolvers zod

# UI y Componentes
npm install tailwindcss @headlessui/react @heroicons/react
npm install react-hot-toast framer-motion

# Utilidades
npm install date-fns lodash
```

## Fase 2: Módulo de Autenticación y Autorización

### 2.1 Servicios de Autenticación
- `src/services/admin/authService.js`:
  - `login(credentials)`: POST a `/auth/login/`
  - `refreshToken(token)`: POST a `/auth/token/refresh/`
  - `logout()`: POST a `/auth/logout/`
  - `getProfile()`: GET a `/auth/profile/`

### 2.2 Contexto de Autenticación
- `src/context/AuthContext.jsx`:
  - Estado: `user`, `token`, `isLoading`, `error`
  - Métodos: `login`, `logout`, `refreshToken`
  - Almacenamiento de tokens en localStorage o cookies seguras
  - Decodificación de JWT para extraer roles y permisos

### 2.3 Componentes de Autenticación
- `src/components/auth/LoginForm.jsx`: Formulario de inicio de sesión
- `src/components/auth/ProtectedRoute.jsx`: HOC para proteger rutas
- `src/components/auth/RoleBasedRoute.jsx`: HOC para rutas basadas en roles

### 2.4 Páginas de Autenticación
- `src/pages/Auth/LoginPage.jsx`: Página de inicio de sesión
- `src/pages/Auth/ProfilePage.jsx`: Perfil de usuario

## Fase 3: Módulo de Gestión de Usuarios

### 3.1 Servicios de Usuarios
- `src/services/admin/userService.js`:
  - `getUsers(params)`: GET a `/users/`
  - `getUserById(id)`: GET a `/users/{id}/`
  - `createUser(data)`: POST a `/users/`
  - `updateUser(id, data)`: PUT a `/users/{id}/`
  - `deleteUser(id)`: DELETE a `/users/{id}/`
  - `activateUser(id)`: POST a `/users/{id}/activate/`
  - `deactivateUser(id)`: POST a `/users/{id}/deactivate/`

### 3.2 Hooks de Usuarios
- `src/hooks/useUsers.js`:
  - `useGetUsers(params)`: Hook para listar usuarios con filtros
  - `useGetUser(id)`: Hook para obtener un usuario específico
  - `useCreateUser()`: Hook para crear usuarios
  - `useUpdateUser()`: Hook para actualizar usuarios
  - `useDeleteUser()`: Hook para eliminar usuarios
  - `useActivateUser()`: Hook para activar usuarios
  - `useDeactivateUser()`: Hook para desactivar usuarios

### 3.3 Componentes de Usuarios
- `src/components/users/UserTable.jsx`: Tabla de usuarios con TanStack Table
- `src/components/users/UserFormModal.jsx`: Modal de creación/edición
- `src/components/users/UserFilters.jsx`: Filtros para la tabla de usuarios
- `src/components/users/UserActions.jsx`: Acciones por usuario (editar, eliminar, etc.)

### 3.4 Páginas de Usuarios
- `src/pages/users/UserListPage.jsx`: Listado principal de usuarios
- `src/pages/users/UserDetailPage.jsx`: Detalles de un usuario específico

## Fase 4: Módulo de Gestión de Doctores

### 4.1 Servicios de Doctores
- `src/services/admin/doctorService.js`:
  - `getDoctors(params)`: GET a `/doctors/`
  - `getDoctorById(id)`: GET a `/doctors/{id}/`
  - `createDoctor(data)`: POST a `/doctors/`
  - `updateDoctor(id, data)`: PUT a `/doctors/{id}/`
  - `deleteDoctor(id)`: DELETE a `/doctors/{id}/`
  - `getDoctorSpecialties(id)`: GET a `/doctors/{id}/specialties/`
  - `updateDoctorSpecialties(id, specialties)`: PUT a `/doctors/{id}/specialties/`
  - `getDoctorAvailability(id)`: GET a `/doctors/{id}/availability/`
  - `updateDoctorAvailability(id, availability)`: PUT a `/doctors/{id}/availability/`

### 4.2 Hooks de Doctores
- `src/hooks/useDoctors.js`:
  - Hooks para CRUD de doctores
  - Hooks para gestión de especialidades de doctores
  - Hooks para gestión de disponibilidad

### 4.3 Componentes de Doctores
- `src/components/doctors/DoctorTable.jsx`: Tabla de doctores
- `src/components/doctors/DoctorFormModal.jsx`: Modal de creación/edición
- `src/components/doctors/SpecialtySelector.jsx`: Selector de especialidades
- `src/components/doctors/AvailabilityScheduler.jsx`: Programador de disponibilidad

### 4.4 Páginas de Doctores
- `src/pages/doctors/DoctorListPage.jsx`: Listado principal de doctores
- `src/pages/doctors/DoctorDetailPage.jsx`: Detalles de un doctor específico
- `src/pages/doctors/DoctorSchedulePage.jsx`: Gestión de horarios del doctor

## Fase 5: Módulo de Gestión de Citas

### 5.1 Servicios de Citas
- `src/services/main/appointmentService.js`:
  - `getAppointments(params)`: GET a `/appointments/`
  - `getAppointmentById(id)`: GET a `/appointments/{id}/`
  - `createAppointment(data)`: POST a `/appointments/`
  - `updateAppointment(id, data)`: PUT a `/appointments/{id}/`
  - `cancelAppointment(id, reason)`: POST a `/appointments/{id}/cancel/`
  - `rescheduleAppointment(id, data)`: POST a `/appointments/{id}/reschedule/`
  - `markAsCompleted(id)`: POST a `/appointments/{id}/complete/`
  - `markAsNoShow(id)`: POST a `/appointments/{id}/no-show/`
  - `getPendingValidation()`: GET a `/appointments/pending-validation/`
  - `validatePayment(id)`: POST a `/appointments/{id}/validate-payment/`
  - `getAvailableSlots(doctorId, date)`: GET a `/appointments/available-slots/`

### 5.2 Hooks de Citas
- `src/hooks/appointment/useAppointments.js`: Hooks para CRUD de citas
- `src/hooks/appointment/useAppointmentAvailability.js`: Hook para consultar disponibilidad
- `src/hooks/appointment/useAppointmentMutations.js`: Hooks para operaciones especiales (cancelar, reprogramar, etc.)
- `src/hooks/appointment/useAppointmentValidation.js`: Hook para validación de pagos

### 5.3 Componentes de Citas
- `src/components/appointments/AppointmentTable.jsx`: Tabla de citas
- `src/components/appointments/AppointmentFormModal.jsx`: Modal de creación/edición
- `src/components/appointments/AppointmentFilters.jsx`: Filtros para la tabla
- `src/components/appointments/AppointmentStatusBadge.jsx`: Badge para estados de citas
- `src/components/appointments/AvailabilityDisplay.jsx`: Visualizador de disponibilidad
- `src/components/appointments/ValidationModal.jsx`: Modal para validación de pagos

### 5.4 Páginas de Citas
- `src/pages/appointments/AppointmentListPage.jsx`: Listado principal de citas
- `src/pages/appointments/AppointmentDetailPage.jsx`: Detalles de una cita específica
- `src/pages/appointments/AppointmentValidationPage.jsx`: Validación de pagos de citas
- `src/pages/appointments/AppointmentSchedulePage.jsx`: Programación de citas

## Fase 6: Módulo de Catálogos

### 6.1 Servicios de Catálogos
- `src/services/admin/catalogService.js`:
  - `getSpecialties(params)`: GET a `/catalogs/specialties/`
  - `getSpecialtyById(id)`: GET a `/catalogs/specialties/{id}/`
  - `createSpecialty(data)`: POST a `/catalogs/specialties/`
  - `updateSpecialty(id, data)`: PUT a `/catalogs/specialties/{id}/`
  - `deleteSpecialty(id)`: DELETE a `/catalogs/specialties/{id}/`
  - `getPaymentMethods()`: GET a `/catalogs/payment-methods/`
  - `updatePaymentMethod(id, data)`: PUT a `/catalogs/payment-methods/{id}/`

### 6.2 Hooks de Catálogos
- `src/hooks/useSpecialties.js`: Hooks para CRUD de especialidades
- `src/hooks/usePaymentMethods.js`: Hooks para gestión de métodos de pago

### 6.3 Componentes de Catálogos
- `src/components/specialties/SpecialtyTable.jsx`: Tabla de especialidades
- `src/components/specialties/SpecialtyFormModal.jsx`: Modal de creación/edición
- `src/components/payments/PaymentMethodTable.jsx`: Tabla de métodos de pago
- `src/components/payments/PaymentMethodFormModal.jsx`: Modal de edición de métodos de pago

### 6.4 Páginas de Catálogos
- `src/pages/specialties/SpecialtyListPage.jsx`: Listado de especialidades
- `src/pages/payments/PaymentMethodListPage.jsx`: Listado de métodos de pago

## Fase 7: Módulo de Chatbot

### 7.1 Servicios de Chatbot
- `src/services/admin/chatbotService.js`:
  - `getKnowledgeBase(params)`: GET a `/chatbot/knowledge/`
  - `createKnowledgeItem(data)`: POST a `/chatbot/knowledge/`
  - `updateKnowledgeItem(id, data)`: PUT a `/chatbot/knowledge/{id}/`
  - `deleteKnowledgeItem(id)`: DELETE a `/chatbot/knowledge/{id}/`
  - `getConversations(params)`: GET a `/chatbot/conversations/`
  - `getConversationById(id)`: GET a `/chatbot/conversations/{id}/`

### 7.2 Hooks de Chatbot
- `src/hooks/useChatbot.js`:
  - Hooks para gestión de base de conocimiento
  - Hooks para análisis de conversaciones

### 7.3 Componentes de Chatbot
- `src/components/chatbot/KnowledgeBaseTable.jsx`: Tabla de base de conocimiento
- `src/components/chatbot/ChatbotFormModal.jsx`: Modal para añadir/editar conocimiento
- `src/components/chatbot/ConversationViewer.jsx`: Visualizador de conversaciones

### 7.4 Páginas de Chatbot
- `src/pages/chatbot/KnowledgeBasePage.jsx`: Gestión de base de conocimiento
- `src/pages/chatbot/ConversationsPage.jsx`: Análisis de conversaciones

## Fase 8: Módulo de Configuración

### 8.1 Servicios de Configuración
- `src/services/admin/settingsService.js`:
  - `getSettings(category)`: GET a `/settings/?category={category}`
  - `updateSetting(key, value)`: PUT a `/settings/{key}/`
  - `getCategories()`: GET a `/settings/categories/`

### 8.2 Hooks de Configuración
- `src/hooks/useSettings.js`:
  - `useGetSettings(category)`: Hook para obtener configuraciones
  - `useUpdateSetting()`: Hook para actualizar configuraciones

### 8.3 Componentes de Configuración
- `src/components/settings/SettingsCategoryGroup.jsx`: Agrupador por categoría
- `src/components/settings/SettingField.jsx`: Campo de configuración editable

### 8.4 Páginas de Configuración
- `src/pages/settings/SettingsPage.jsx`: Página principal de configuración

## Fase 9: Módulo de Dashboard

### 9.1 Servicios de Dashboard
- `src/services/admin/dashboardService.js`:
  - `getStatistics()`: GET a `/dashboard/statistics/`
  - `getAppointmentStats(period)`: GET a `/dashboard/appointments-stats/?period={period}`
  - `getRevenueStats(period)`: GET a `/dashboard/revenue-stats/?period={period}`
  - `getUserStats()`: GET a `/dashboard/user-stats/`

### 9.2 Hooks de Dashboard
- `src/hooks/useDashboardStats.js`:
  - Hooks para diferentes tipos de estadísticas

### 9.3 Componentes de Dashboard
- `src/components/dashboard/StatCard.jsx`: Tarjeta de estadística
- `src/components/dashboard/AppointmentChart.jsx`: Gráfico de citas
- `src/components/dashboard/RevenueChart.jsx`: Gráfico de ingresos
- `src/components/dashboard/TopDoctorsTable.jsx`: Tabla de doctores más solicitados

### 9.4 Páginas de Dashboard
- `src/pages/DashboardPage.jsx`: Página principal con KPIs y gráficos

## Fase 10: Módulo Médico

### 10.1 Servicios Médicos
- `src/services/main/medicalService.js`:
  - `getMedicalRecords(patientId)`: GET a `/medical/records/?patient={patientId}`
  - `getMedicalRecordById(id)`: GET a `/medical/records/{id}/`
  - `createMedicalRecord(data)`: POST a `/medical/records/`
  - `updateMedicalRecord(id, data)`: PUT a `/medical/records/{id}/`
  - `getMedicalTests(patientId)`: GET a `/medical/tests/?patient={patientId}`
  - `createMedicalTest(data)`: POST a `/medical/tests/`
  - `updateMedicalTest(id, data)`: PUT a `/medical/tests/{id}/`

### 10.2 Hooks Médicos
- `src/hooks/useMedicalRecords.js`: Hooks para gestión de historias clínicas
- `src/hooks/useMedicalTests.js`: Hooks para gestión de pruebas médicas

### 10.3 Componentes Médicos
- `src/components/medical/MedicalRecordTable.jsx`: Tabla de historias clínicas
- `src/components/medical/MedicalRecordForm.jsx`: Formulario de historia clínica
- `src/components/medical/MedicalTestTable.jsx`: Tabla de pruebas médicas
- `src/components/medical/MedicalTestForm.jsx`: Formulario de prueba médica

### 10.4 Páginas Médicas
- `src/pages/medical/MedicalRecordsPage.jsx`: Gestión de historias clínicas
- `src/pages/medical/MedicalRecordDetailPage.jsx`: Detalle de historia clínica
- `src/pages/medical/MedicalTestsPage.jsx`: Gestión de pruebas médicas

## Fase 11: Módulo de Pagos

### 11.1 Servicios de Pagos
- `src/services/main/paymentService.js`:
  - `getPayments(params)`: GET a `/payments/`
  - `getPaymentById(id)`: GET a `/payments/{id}/`
  - `createPayment(data)`: POST a `/payments/`
  - `confirmPayment(id, data)`: POST a `/payments/{id}/confirm/`
  - `refundPayment(id)`: POST a `/payments/{id}/refund/`
  - `getPaymentGateways()`: GET a `/payments/gateways/`
  - `createPaymentOrder(appointmentId, methodId)`: POST a `/payments/orders/`

### 11.2 Hooks de Pagos
- `src/hooks/usePayments.js`:
  - Hooks para CRUD de pagos
  - Hooks para operaciones de pasarela

### 11.3 Componentes de Pagos
- `src/components/payments/PaymentTable.jsx`: Tabla de pagos
- `src/components/payments/PaymentDetailCard.jsx`: Tarjeta de detalle de pago
- `src/components/payments/PaymentMethodSelector.jsx`: Selector de método de pago
- `src/components/payments/PaymentGatewayForm.jsx`: Formulario de integración con pasarela

### 11.4 Páginas de Pagos
- `src/pages/payments/PaymentListPage.jsx`: Listado de pagos
- `src/pages/payments/PaymentDetailPage.jsx`: Detalle de un pago
- `src/pages/payments/PaymentGatewayPage.jsx`: Configuración de pasarelas

## Fase 12: Módulo de Auditoría

### 12.1 Servicios de Auditoría
- `src/services/admin/auditService.js`:
  - `getAuditLogs(params)`: GET a `/audit/logs/`
  - `getAuditLogById(id)`: GET a `/audit/logs/{id}/`
  - `getAuditStats()`: GET a `/audit/stats/`

### 12.2 Hooks de Auditoría
- `src/hooks/useAudit.js`:
  - `useGetAuditLogs(params)`: Hook para listar logs de auditoría
  - `useGetAuditStats()`: Hook para estadísticas de auditoría

### 12.3 Componentes de Auditoría
- `src/components/audit/AuditLogTable.jsx`: Tabla de logs de auditoría
- `src/components/audit/AuditLogDetail.jsx`: Detalle de log de auditoría
- `src/components/audit/AuditFilters.jsx`: Filtros para logs de auditoría

### 12.4 Páginas de Auditoría
- `src/pages/audit/AuditLogListPage.jsx`: Listado de logs de auditoría
- `src/pages/audit/AuditLogDetailPage.jsx`: Detalle de un log específico

## Fase 13: Módulo de Analítica

### 13.1 Servicios de Analítica
- `src/services/admin/analyticsService.js`:
  - `getAppointmentAnalytics(params)`: GET a `/analytics/appointments/`
  - `getRevenueAnalytics(params)`: GET a `/analytics/revenue/`
  - `getDoctorPerformance(params)`: GET a `/analytics/doctors/`
  - `getPatientDemographics()`: GET a `/analytics/patients/demographics/`
  - `getSpecialtyDemand()`: GET a `/analytics/specialties/demand/`

### 13.2 Hooks de Analítica
- `src/hooks/useAnalytics.js`:
  - Hooks para diferentes tipos de análisis

### 13.3 Componentes de Analítica
- `src/components/analytics/AnalyticsChart.jsx`: Componente de gráfico configurable
- `src/components/analytics/PerformanceTable.jsx`: Tabla de rendimiento
- `src/components/analytics/DemographicsChart.jsx`: Gráfico de demografía
- `src/components/analytics/DateRangePicker.jsx`: Selector de rango de fechas

### 13.4 Páginas de Analítica
- `src/pages/analytics/AppointmentAnalyticsPage.jsx`: Análisis de citas
- `src/pages/analytics/RevenueAnalyticsPage.jsx`: Análisis de ingresos
- `src/pages/analytics/DoctorPerformancePage.jsx`: Rendimiento de doctores
- `src/pages/analytics/PatientDemographicsPage.jsx`: Demografía de pacientes

## Fase 14: Integración y Control de Acceso

### 14.1 Mejoras en el Sistema de Autenticación
- Implementación de JWT con roles y permisos
- Manejo de tokens de refresco
- Interceptores para manejo de errores 401/403

### 14.2 Control de Acceso Basado en Roles (RBAC)
- `src/components/auth/RoleGuard.jsx`: Componente para proteger rutas por rol
- `src/hooks/usePermissions.js`: Hook para verificar permisos
- Configuración de rutas en `AppRouter.jsx` con protección por rol

### 14.3 Navegación Dinámica
- Sidebar con elementos que se muestran según el rol del usuario
- Redirecciones inteligentes basadas en rol después del login

## Fase 15: Optimización y Despliegue

### 15.1 Optimización de Rendimiento
- Code-splitting con React.lazy y Suspense
- Memoización de componentes costosos
- Implementación de virtualizacion para tablas grandes

### 15.2 Preparación para Producción
- Configuración de variables de entorno para diferentes ambientes
- Optimización de bundling con Vite
- Implementación de PWA (Progressive Web App)

### 15.3 Estrategia de Despliegue
- Build de producción con `npm run build`
- Despliegue en plataformas como Vercel, Netlify o AWS S3/CloudFront
- Configuración de CORS y proxies para APIs

### 15.4 Monitoreo y Análisis
- Integración con herramientas de monitoreo (Sentry)
- Implementación de Google Analytics o Plausible
- Logging de errores del cliente 