# 🏥 Contexto y Arquitectura: Hospital Dashboard (React)

Este documento describe la arquitectura, el propósito y los flujos de trabajo del `hospital_dashboard`, el panel de control central para la administración y operación del portal virtual de Urovital.

---

## 1. Propósito y Rol en el Ecosistema

El `hospital_dashboard` es una aplicación de React de página única (SPA) que sirve como la interfaz principal para el personal interno, incluyendo **Administradores** y **Recepcionistas**. No está destinada a pacientes.

Su función es dual:

1.  **Portal Administrativo**: Permite a los administradores gestionar las entidades centrales del sistema, como doctores, usuarios, especialidades y configuraciones generales. Para esto, consume la API de `hospital_admin` (Django).
2.  **Portal Operacional de Citas Virtuales**: Permite al personal de recepción gestionar el ciclo de vida de las citas agendadas virtualmente, principalmente la validación de pagos. Para esto, debe consumir la API de `hospital_main` (Spring Boot).

Este panel es el puente que conecta la configuración maestra del sistema con la operación diaria del flujo de citas virtuales.

---

## 2. Arquitectura del Frontend y Módulos Clave

El proyecto está construido con **React**, **Vite** y **Tailwind CSS**. Su estructura está organizada por funcionalidades para facilitar el mantenimiento y la escalabilidad.

-   `src/pages/`: Contiene los componentes de nivel superior que representan las vistas principales de la aplicación (ej. `UserListPage`, `AppointmentListPage`).
-   `src/components/`: Alberga componentes reutilizables, como formularios (`AppointmentFormModal`), elementos de layout (`DashboardLayout`) y campos de UI (`FormField`).
-   `src/services/`: Capa de abstracción para la comunicación con las APIs de backend. Cada servicio (ej. `userService`, `appointmentService`) agrupa las llamadas a los endpoints relacionados con una entidad.
-   `src/hooks/`: Lógica de estado y efectos secundarios encapsulada en hooks personalizados (ej. `useUsers`, `useAppointments`) que son consumidos por las páginas.
-   `src/context/`: Provee estado global para la aplicación, principalmente para la autenticación (`AuthContext`).
-   `src/api/apiClient.js`: Cliente Axios centralizado. Actualmente, está configurado para comunicarse exclusivamente con la API de Django (`hospital_admin`). Incluye interceptores para la inyección de tokens JWT y manejo de errores.

---

## 3. Flujos de Trabajo por Rol

### 3.1. Flujo del Administrador (Implementado)

Este flujo utiliza exclusivamente la **API de Django (`hospital_admin`)**.

1.  **Autenticación**: El administrador inicia sesión a través de la `LoginPage`.
2.  **Navegación**: Utiliza la barra lateral para acceder a los diferentes módulos de gestión:
    -   `Usuarios`: CRUD para todos los usuarios del sistema (pacientes, doctores, recepcionistas, etc.).
    -   `Doctores`: Gestión de perfiles de doctores.
    -   `Especialidades`: CRUD para las especialidades médicas.
    -   `Settings`: Configuración de parámetros del sistema.
3.  **Acción**: Realiza operaciones CRUD a través de formularios modales que se comunican con la API de Django.

### 3.2. Flujo de la Recepcionista (A Implementar)

Este flujo es el núcleo del "Portal de Validación" y requiere la integración con la **API de Spring Boot (`hospital_main`)**.

1.  **Acceso al Portal de Validación**: La recepcionista navega a una sección dedicada dentro del dashboard (ej. `Citas por Validar`).
2.  **Visualización de Citas Pendientes**: La página muestra una lista de citas con el estado `paymentStatus = PROCESSING`. Esta información se obtiene de la API de Spring Boot.
3.  **Verificación del Pago**: Al seleccionar una cita, el dashboard muestra los detalles, incluyendo el comprobante de pago subido por el paciente.
4.  **Confirmación en el Sistema**:
    -   La recepcionista hace clic en "Validar Pago".
    -   El dashboard realiza una llamada a un endpoint específico en la API de Spring Boot para actualizar el `payment.status` y el `appointment.paymentStatus` a `COMPLETED`.
    -   La cita desaparece de la lista de pendientes y se actualiza su estado en todo el sistema.
5.  **Gestión de Llegada**: Cuando el paciente llega físicamente, la recepcionista busca la cita (ya validada) y actualiza su estado a `LLEGÓ` o `EN ESPERA`.

---

## 4. Retos y Puntos de Evolución

Basado en el análisis del código y los contextos de los backends, se identifican los siguientes puntos clave para la evolución del dashboard:

-   **Integración Multi-API**: El reto técnico más importante es permitir que el `apiClient` o un nuevo cliente se comunique tanto con la API de Django como con la de Spring Boot. Será necesario establecer una estrategia para dirigir las peticiones al backend correcto según el contexto de la operación (ej. gestión vs. validación de citas).
-   **Estandarización de APIs**: El código del frontend (`appointmentService.js`) revela un esfuerzo significativo para manejar inconsistencias en las rutas y formatos de respuesta de la API de Django. Fomentar la estandarización en el backend, como se sugiere en `hospital_admin/context.md`, simplificará enormemente el código del dashboard.
-   **Desarrollo del Portal de Validación**: Es necesario crear las vistas y componentes de React para materializar el "Flujo de la Recepcionista", incluyendo la visualización de comprobantes y las acciones de validación.

## 5. Conclusión

El `hospital_dashboard` ha evolucionado de un simple panel administrativo a una herramienta operacional crítica para el nuevo flujo de citas virtuales. Su desarrollo futuro debe centrarse en la integración con la API transaccional de Spring Boot para completar su rol dual y servir eficazmente tanto a administradores como a recepcionistas. 