# Flujo de Trabajo Detallado: Hospital Dashboard

Este documento describe los flujos de trabajo específicos para los diferentes roles de usuario dentro del `hospital_dashboard`. Ilustra cómo la aplicación interactúa con las dos APIs de backend (`hospital_admin` y `hospital_main`) para cumplir sus funciones duales de administración y operación.

---

## Flujo 1: El Administrador (Gestión y Configuración del Sistema)

**Objetivo**: Configurar y mantener los datos maestros y las entidades centrales del sistema.
**API Consumida**: `hospital_admin` (Django REST API) en su totalidad.

#### **Paso 1: Autenticación**
1.  El Administrador navega a la página de inicio de sesión del dashboard.
2.  Ingresa sus credenciales (email y contraseña).
3.  El dashboard envía una petición `POST` al endpoint `/api/auth/token/` de la **API de Django**.
4.  Al recibir una respuesta exitosa con los tokens JWT, el dashboard los almacena de forma segura (ej. `localStorage`) y redirige al administrador a la página principal del dashboard.

#### **Paso 2: Gestión de Catálogos (Ej. Especialidades)**
1.  El Administrador navega a la sección "Especialidades" a través del menú lateral.
2.  La página solicita la lista de especialidades al endpoint `GET /api/catalogs/specialties/` de la **API de Django**.
3.  Se muestra una tabla con las especialidades existentes.
4.  El Administrador hace clic en "Crear Nueva". Se abre un formulario modal.
5.  Tras rellenar el nombre, hace clic en "Guardar". El dashboard envía una petición `POST` a `/api/catalogs/specialties/` (Django).
6.  La tabla se refresca automáticamente para mostrar la nueva especialidad, que ahora estará disponible para los pacientes al agendar una cita.

#### **Paso 3: Gestión de Personal (Ej. Crear un nuevo Doctor)**
1.  El Administrador navega a la sección "Doctores".
2.  La página muestra la lista de doctores obtenida de `GET /api/doctors/` (Django).
3.  El Administrador crea un nuevo doctor, rellenando su perfil, incluyendo su asociación a una `Especialidad` (obtenida del catálogo).
4.  Al guardar, el dashboard realiza una petición `POST` a `/api/doctors/` (Django).
5.  El nuevo doctor queda registrado en el sistema y disponible para que se le asignen citas.

---

## Flujo 2: El Recepcionista (Operación del Portal de Validación de Citas)

**Objetivo**: Validar las citas virtuales agendadas por los pacientes, sirviendo de puente entre el pago virtual y la atención física.
**API Consumida**: Principalmente `hospital_main` (Spring Boot API) para operaciones transaccionales de citas.

#### **Paso 1: Autenticación**
1.  El proceso es idéntico al del Administrador, usando la misma **API de Django** para la autenticación centralizada.
2.  Una vez autenticado, el dashboard identifica el rol "RECEPTIONIST" y ajusta la interfaz (ej. mostrando un menú de navegación diferente y un dashboard enfocado en citas).

#### **Paso 2: Revisión de Citas Pendientes**
1.  La recepcionista accede a la sección "Validación de Citas".
2.  El dashboard envía una petición `GET` al endpoint `/api/appointments?paymentStatus=PROCESSING` de la **API de Spring Boot (`hospital_main`)**.
3.  Se muestra una tabla con las citas que los pacientes han agendado y para las cuales han subido un comprobante de pago, pero que aún no han sido validadas.

#### **Paso 3: Verificación del Comprobante de Pago**
1.  La recepcionista selecciona una cita de la lista haciendo clic en "Revisar y Validar".
2.  Se abre un modal. El dashboard realiza una petición `GET` a `/api/appointments/{id}` (Spring Boot) para obtener los detalles completos, incluyendo la URL del comprobante de pago.
3.  El dashboard muestra la información clave de la cita y una vista previa del comprobante de pago (ej. una imagen).
4.  **Acción externa**: La recepcionista verifica en el sistema bancario del centro que el pago correspondiente al monto de la cita fue recibido exitosamente.

#### **Paso 4: Confirmación (o Rechazo) de la Cita**
1.  **Si el pago es correcto**, la recepcionista hace clic en el botón "Confirmar Pago".
2.  El dashboard envía una petición `PATCH` al endpoint `/api/appointments/{id}/payment-validation` de la **API de Spring Boot**.
3.  El backend de Spring Boot actualiza el estado del pago a `COMPLETED` y el estado de la cita a `CONFIRMED`.
4.  **Si el pago es incorrecto**, podría haber un botón "Rechazar" que notifique al paciente (lógica a futuro).

#### **Paso 5: Actualización de la Interfaz y Flujo Final**
1.  Tras una confirmación exitosa, el modal se cierra y la tabla de citas pendientes se actualiza automáticamente. La cita recién validada desaparece de la lista.
2.  La cita ahora es oficial. Cuando el paciente llega físicamente a la clínica, la recepcionista puede buscarlo en el sistema (en una vista de "Citas del Día") y marcar su estado como "En Espera" o "Atendido", desencadenando nuevas peticiones a la API de Spring Boot. 