GET    /api/analytics/summary/
      → Proporciona un resumen analítico con las principales métricas de rendimiento del hospital.

GET    /api/appointments/
      → Provee operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para las citas médicas.
Incluye filtros por paciente, doctor, especialidad, estado y fecha.

POST   /api/appointments/
      → Provee operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para las citas médicas.
Incluye filtros por paciente, doctor, especialidad, estado y fecha.

GET    /api/appointments/{id}/
      → Provee operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para las citas médicas.
Incluye filtros por paciente, doctor, especialidad, estado y fecha.

PUT    /api/appointments/{id}/
      → Provee operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para las citas médicas.
Incluye filtros por paciente, doctor, especialidad, estado y fecha.

PATCH  /api/appointments/{id}/
      → Provee operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para las citas médicas.
Incluye filtros por paciente, doctor, especialidad, estado y fecha.

DELETE /api/appointments/{id}/
      → Provee operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para las citas médicas.
Incluye filtros por paciente, doctor, especialidad, estado y fecha.

POST   /api/appointments/{id}/cancel/
      → Cancelar una Cita

POST   /api/appointments/{id}/mark_as_arrived/
      → Registrar Llegada de Paciente

POST   /api/appointments/{id}/mark_as_completed/
      → Marcar Cita como Completada

POST   /api/appointments/{id}/mark_as_no_show/
      → Marcar Paciente como Ausente

POST   /api/appointments/{id}/reschedule/
      → Reprogramar una Cita

GET    /api/appointments/available-slots/
      → Consultar Cupos Disponibles (GET)

POST   /api/appointments/available-slots/
      → Consultar Cupos Disponibles (POST)

GET    /api/appointments/available-slots-get/
      → Consultar Cupos Disponibles (GET)

GET    /api/appointments/available-time-blocks/
      → Consultar Bloques Horarios Disponibles

GET    /api/appointments/doctors-by-specialty/
      → Consultar Doctores por Especialidad

GET    /api/appointments/pending_validation/
      → Consultar Citas Pendientes de Validación

GET    /api/appointments/specialties/
      → Consultar Especialidades Activas

GET    /api/appointments/stats/
      → Obtener Estadísticas de Citas

GET    /api/appointments/today/
      → Consultar Citas para Hoy

GET    /api/appointments/upcoming/
      → Consultar Próximas Citas

GET    /api/audit/
      → Listar todos los logs de auditoría

GET    /api/audit/{id}/
      → Obtener un log de auditoría

DELETE /api/audit/{id}/
      → Eliminar un log de auditoría

GET    /api/audit/recent/
      → Obtener logs recientes

POST   /api/auth/login/
      → Login para administradores del hospital

POST   /api/auth/logout/
      → Logout del administrador

GET    /api/auth/profile/
      → Obtener perfil del usuario autenticado

POST   /api/auth/refresh-token/
      → Refrescar token de autenticación

GET    /api/catalogs/patient-options/
      → Obtener opciones para formulario de pacientes

GET    /api/catalogs/payment-methods/
      → Listar todos los métodos de pago

POST   /api/catalogs/payment-methods/
      → Crear un nuevo método de pago

GET    /api/catalogs/payment-methods/{id}/
      → Obtener detalles de un método de pago

PUT    /api/catalogs/payment-methods/{id}/
      → Actualizar un método de pago

PATCH  /api/catalogs/payment-methods/{id}/
      → ViewSet para gestión de métodos de pago
Actualizado para integración con pasarelas de pago

DELETE /api/catalogs/payment-methods/{id}/
      → Eliminar un método de pago

GET    /api/catalogs/payment-methods/by_gateway/
      → Obtener métodos de pago por pasarela

GET    /api/catalogs/payment-methods/by_type/
      → Obtener métodos de pago por tipo

GET    /api/catalogs/payment-methods/no_fee/
      → Obtener métodos de pago sin comisión

GET    /api/catalogs/specialties/
      → Listar todas las especialidades médicas

POST   /api/catalogs/specialties/
      → Crear una nueva especialidad

GET    /api/catalogs/specialties/{id}/
      → Obtener detalles de una especialidad

PUT    /api/catalogs/specialties/{id}/
      → Actualizar una especialidad

PATCH  /api/catalogs/specialties/{id}/
      → ViewSet para gestión de especialidades médicas

DELETE /api/catalogs/specialties/{id}/
      → Eliminar una especialidad

GET    /api/catalogs/specialties/price_stats/
      → Estadísticas de precios de especialidades

GET    /api/catalogs/specialties/with_discount/
      → Obtener especialidades con descuento

GET    /api/chatbot/api/analytics/
      → Obtener analíticas del chatbot

POST   /api/chatbot/api/chat/
      → Procesar consulta del chatbot

GET    /api/chatbot/api/conversations/
      → ViewSet para gestión de conversaciones del chatbot

POST   /api/chatbot/api/conversations/
      → ViewSet para gestión de conversaciones del chatbot

GET    /api/chatbot/api/conversations/{id}/
      → ViewSet para gestión de conversaciones del chatbot

PUT    /api/chatbot/api/conversations/{id}/
      → ViewSet para gestión de conversaciones del chatbot

PATCH  /api/chatbot/api/conversations/{id}/
      → ViewSet para gestión de conversaciones del chatbot

DELETE /api/chatbot/api/conversations/{id}/
      → ViewSet para gestión de conversaciones del chatbot

POST   /api/chatbot/api/conversations/{id}/add_feedback/
      → Agregar feedback a una conversación

GET    /api/chatbot/api/conversations/analytics/
      → Obtener analíticas del chatbot

POST   /api/chatbot/api/conversations/chat_query/
      → Procesar consulta del chatbot

GET    /api/chatbot/api/conversations/conversation_history/
      → Obtener historial de conversación por sesión

POST   /api/chatbot/api/feedback/{id}/
      → Agregar feedback a una conversación

GET    /api/chatbot/api/history/
      → Obtener historial de conversación por sesión

GET    /api/chatbot/api/knowledge-base/
      → ViewSet para gestión de base de conocimientos del chatbot

POST   /api/chatbot/api/knowledge-base/
      → ViewSet para gestión de base de conocimientos del chatbot

GET    /api/chatbot/api/knowledge-base/{id}/
      → ViewSet para gestión de base de conocimientos del chatbot

PUT    /api/chatbot/api/knowledge-base/{id}/
      → ViewSet para gestión de base de conocimientos del chatbot

PATCH  /api/chatbot/api/knowledge-base/{id}/
      → ViewSet para gestión de base de conocimientos del chatbot

DELETE /api/chatbot/api/knowledge-base/{id}/
      → ViewSet para gestión de base de conocimientos del chatbot

POST   /api/chatbot/api/knowledge-base/{id}/increment_usage/
      → Incrementar contador de uso

GET    /api/chatbot/api/knowledge-base/active_only/
      → Obtener solo entradas activas

GET    /api/chatbot/api/knowledge-base/categories/
      → Obtener todas las categorías disponibles

POST   /api/chatbot/api/knowledge-base/search_knowledge/
      → Buscar en la base de conocimientos

GET    /api/chatbot/api/knowledge/active/
      → Obtener solo entradas activas

GET    /api/chatbot/api/knowledge/categories/
      → Obtener todas las categorías disponibles

POST   /api/chatbot/api/knowledge/search/
      → Buscar en la base de conocimientos

GET    /api/dashboard/
      → Resumen general del dashboard con datos en tiempo real.

GET    /api/dashboard/recent-activity/
      → Actividad reciente del sistema (últimos 10 eventos).

GET    /api/dashboard/stats/
      → Estadísticas detalladas del hospital con datos reales.

GET    /api/doctors/availability/
      → Listar horarios de doctores

POST   /api/doctors/availability/
      → Crear horario para doctor

GET    /api/doctors/availability/{id}/
      → Obtener horario de doctor

PUT    /api/doctors/availability/{id}/
      → Actualizar horario de doctor

PATCH  /api/doctors/availability/{id}/
      → ViewSet para gestión de horarios de doctores

DELETE /api/doctors/availability/{id}/
      → Eliminar horario de doctor

GET    /api/doctors/availability/by_day/
      → Horarios por día de la semana

GET    /api/doctors/availability/by_doctor/
      → Horarios por doctor

GET    /api/doctors/doctors/
      → Listar todos los doctores

POST   /api/doctors/doctors/
      → Crear un nuevo doctor

GET    /api/doctors/doctors/{id}/
      → Obtener detalles de un doctor

PUT    /api/doctors/doctors/{id}/
      → Actualizar un doctor

PATCH  /api/doctors/doctors/{id}/
      → ViewSet para gestión de doctores

DELETE /api/doctors/doctors/{id}/
      → Eliminar un doctor

GET    /api/doctors/doctors/available_on_day/
      → Doctores disponibles en un día específico

GET    /api/doctors/doctors/by_cmp/
      → Buscar doctor por CMP

GET    /api/doctors/doctors/by_specialty/
      → Doctores por especialidad

GET    /api/doctors/doctors/by_type/
      → Doctores por tipo

GET    /api/doctors/doctors/can_refer_doctors/
      → Doctores que pueden derivar

GET    /api/doctors/doctors/debug_specialties/
      → Debug: verificar especialidades disponibles

GET    /api/doctors/specialties/
      → Listar especialidades de doctores

POST   /api/doctors/specialties/
      → Asignar especialidad a doctor

GET    /api/doctors/specialties/{id}/
      → Obtener especialidad de doctor

PUT    /api/doctors/specialties/{id}/
      → Actualizar especialidad de doctor

PATCH  /api/doctors/specialties/{id}/
      → ViewSet para gestión de especialidades de doctores

DELETE /api/doctors/specialties/{id}/
      → Quitar especialidad de doctor

GET    /api/doctors/specialties/by_doctor/
      → Especialidades por doctor

GET    /api/medical/records/
      → Listar todos los historiales médicos

POST   /api/medical/records/
      → Crear un nuevo historial médico

GET    /api/medical/records/{id}/
      → Obtener un historial médico

PUT    /api/medical/records/{id}/
      → Actualizar un historial médico

PATCH  /api/medical/records/{id}/
      → Actualizar parcialmente un historial médico

DELETE /api/medical/records/{id}/
      → Eliminar un historial médico

GET    /api/medical/records/recent/
      → Obtener historiales recientes

GET    /api/payments/
      → Listar todos los pagos

POST   /api/payments/
      → Crear un nuevo pago

GET    /api/payments/{id}/
      → Obtener un pago

PUT    /api/payments/{id}/
      → Actualizar un pago

PATCH  /api/payments/{id}/
      → Actualizar parcialmente un pago

DELETE /api/payments/{id}/
      → Eliminar un pago

POST   /api/payments/{id}/refund/
      → Reembolsar un pago

GET    /api/payments/completed/
      → Obtener pagos completados

GET    /api/payments/processing/
      → Obtener pagos en procesamiento

POST   /api/payments/webhooks/mercadopago/
      → Recibir webhook de Mercado Pago

POST   /api/payments/webhooks/pagoefectivo/
      → Recibir webhook de PagoEfectivo

GET    /api/settings/hospital-settings/
      → ViewSet para gestión de configuraciones del hospital

POST   /api/settings/hospital-settings/
      → ViewSet para gestión de configuraciones del hospital

GET    /api/settings/hospital-settings/{id}/
      → ViewSet para gestión de configuraciones del hospital

PUT    /api/settings/hospital-settings/{id}/
      → ViewSet para gestión de configuraciones del hospital

PATCH  /api/settings/hospital-settings/{id}/
      → ViewSet para gestión de configuraciones del hospital

DELETE /api/settings/hospital-settings/{id}/
      → ViewSet para gestión de configuraciones del hospital

POST   /api/settings/hospital-settings/bulk_update/
      → Actualizar múltiples configuraciones a la vez

GET    /api/settings/hospital-settings/by_category/
      → Obtener configuraciones agrupadas por categoría

POST   /api/settings/hospital-settings/initialize_defaults/
      → Inicializar configuraciones por defecto

GET    /api/settings/hospital-settings/public_settings/
      → Obtener configuraciones públicas

GET    /api/users/patients/
      → Listar todos los pacientes

POST   /api/users/patients/
      → Crear un nuevo paciente

GET    /api/users/patients/{id}/
      → Obtener detalles de un paciente

PUT    /api/users/patients/{id}/
      → Actualizar un paciente

PATCH  /api/users/patients/{id}/
      → ViewSet para la gestión de pacientes.
Permite crear, leer, actualizar y eliminar registros de pacientes.

DELETE /api/users/patients/{id}/
      → Eliminar un paciente

POST   /api/users/patients/{id}/verify_reniec/
      → Verificar paciente con RENIEC

GET    /api/users/patients/by_document/
      → Buscar paciente por documento

GET    /api/users/patients/emergency_contacts/
      → Obtener contactos de emergencia

GET    /api/users/patients/search/
      → Búsqueda avanzada de pacientes

GET    /api/users/patients/stats/
      → Estadísticas de pacientes

GET    /api/users/users/
      → Listar todos los usuarios

POST   /api/users/users/
      → Crear un nuevo usuario

GET    /api/users/users/{id}/
      → Obtener detalles de un usuario

PUT    /api/users/users/{id}/
      → Actualizar un usuario

PATCH  /api/users/users/{id}/
      → ViewSet para gestión de usuarios

DELETE /api/users/users/{id}/
      → Eliminar un usuario

POST   /api/users/users/{id}/toggle_active/
      → Activar/desactivar usuario

GET    /api/users/users/by_email/
      → Buscar usuario por email

GET    /api/users/users/by_role/
      → Usuarios por rol

GET    /api/users/users/stats/
      → Estadísticas de usuarios

GET    /health/
      → Health check endpoint

GET    /info/
      → Información básica de la API

GET    /schema/
      → OpenApi3 schema for this API. Format can be selected via content negotiation.