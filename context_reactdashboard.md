# 🏥 Contexto y Arquitectura: Hospital Dashboard (React)

Este documento describe la arquitectura, el propósito y los flujos de trabajo del `hospital_dashboard`, el panel de control para la administración y operación del ecosistema Urovital.

---

## 1. Propósito y Rol en el Ecosistema

El `hospital_dashboard` es una aplicación de React de página única (SPA) que sirve como la interfaz principal para el personal interno, incluyendo **Administradores** y **Recepcionistas**. No está destinada a pacientes.

Su función principal es ser el frontend exclusivo para la **API de Django (`hospital_admin`)**. A través de este panel, el personal autorizado puede:

-   **Gestionar Entidades Maestras**: Realizar operaciones CRUD sobre usuarios, doctores, pacientes, especialidades, etc.
-   **Configurar el Sistema**: Ajustar parámetros y configuraciones generales.
-   **Operar sobre Citas**: Visualizar, crear, y administrar citas médicas.
-   **Monitorear la Actividad**: Acceder a logs de auditoría y analíticas de la plataforma.

Este dashboard es el centro de mando para toda la data de gestión del sistema.

---

## 2. Arquitectura del Frontend y Módulos Clave

El proyecto está construido con **React**, **Vite** y **Tailwind CSS**. Su estructura está organizada por funcionalidades para facilitar el mantenimiento y la escalabilidad.

-   `src/pages/`: Contiene los componentes de nivel superior que representan las vistas principales (ej. `UserListPage`, `AppointmentListPage`).
-   `src/components/`: Alberga componentes reutilizables, como formularios (`AppointmentFormModal`), layout (`DashboardLayout`) y campos de UI (`FormField`).
-   `src/services/`: Capa de abstracción para la comunicación con la API de Django (`hospital_admin`).
-   `src/hooks/`: Lógica de estado y `react-query` encapsulada en hooks personalizados (ej. `useUsers`, `useAppointments`).
-   `src/context/`: Provee estado global para la aplicación, principalmente para la autenticación (`AuthContext`).
-   `src/api/adminApiClient.js`: Cliente Axios centralizado, configurado exclusivamente para comunicarse con la API de Django. Incluye interceptores para la inyección de tokens JWT y manejo de errores.

---

## 3. Flujos de Trabajo por Rol

### 3.1. Flujo del Administrador y Recepcionista

Ambos roles utilizan este dashboard, con posibles diferencias en los permisos de acceso a ciertos módulos. El flujo general es:

1.  **Autenticación**: Inician sesión a través de la `LoginPage`, obteniendo un token JWT de la API de Django.
2.  **Navegación**: Utilizan la barra lateral para acceder a los diferentes módulos de gestión (Usuarios, Doctores, Citas, etc.).
3.  **Acción**: Realizan operaciones CRUD a través de formularios modales que se comunican directamente con la API de Django.

El sistema de pagos para las citas de pacientes (manejado en el portal del paciente) es a través de la pasarela de Mercado Pago. Las confirmaciones y estados de pago se gestionan automáticamente vía webhooks entre la pasarela y la API de Spring Boot, y esta información se refleja en la base de datos compartida, pudiendo ser consultada desde este panel.

---

## 4. Conclusión

El `hospital_dashboard` es una herramienta administrativa robusta y enfocada. Su única fuente de verdad y comunicación es la API de Django (`hospital_admin`), lo que garantiza una arquitectura limpia y mantenible. Su propósito es dar al personal interno el control total sobre los datos y la configuración del ecosistema hospitalario. 