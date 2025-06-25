📋 FLUJO 1: PACIENTE AGENDA CITA ONLINE
PASO A PASO DETALLADO:
1. Acceso y Registro
Paciente → Web/Móvil (Spring Boot) → 
Si es nuevo: Registro con DNI (validación RENIEC automática) →
Si existe: Login directo
2. Selección de Cita
Ve especialidades disponibles → Solo ve "Urología" (is_primary=true) →
Selecciona fecha → Ve solo bloques: MORNING (7-13h) o AFTERNOON (16-20h) →
Sistema verifica capacidad disponible en doctor_availability
3. Confirmación y Pago
Ingresa motivo consulta → Ve precio automático (desde specialties.consultation_price) →
Ve advertencia: "Las citas se atienden por orden de llegada en el horario seleccionado" →
Selecciona método pago (Yape/Plin/Tarjeta) → Procesa pago
4. Confirmación Final de pago 
🏥 FLUJO 2: PACIENTE LLEGA PRESENCIALMENTE (WALK-IN)
PROCESO DIRECTO:
1. Llegada y Registro
Paciente llega → Recepcionista (Django Admin) →
Si es nuevo: Registro con DNI → Validación RENIEC automática →
Si existe: Búsqueda rápida por DNI
2. Selección Inmediata
Recepcionista ve especialidades → Solo puede elegir "Urología" →
Ve bloques disponibles del día → Verifica capacidad actual →
Selecciona bloque según hora actual (mañana/tarde)
3. Pago Inmediato
Sistema calcula precio automático → Paciente paga (efectivo/Yape/Plin) →
Si digital: recepcionista valida comprobante → Marca como pagado →
appointment.status = SCHEDULED_PAID inmediatamente
4. Ingreso a Espera
Paciente entra a sala de espera → Se atiende por orden de llegada real →
No hay números de cola, es físico puro

⚕️ FLUJO 3: CONSULTA Y DERIVACIÓN INTERNA
PROCESO DE EVALUACIÓN:
1. Consulta Principal
Dr. Mario atiende paciente → appointment.status = IN_CONSULTATION →
Evalúa caso → Completa medical_record con diagnóstico
2. Decisión de Derivación
Si necesita especialista → Dr. Mario en Django Admin →
Ve especialidades con requires_referral=true →
Selecciona especialidad (ej: Ginecología) → Ingresa motivo médico
3. Creación de Derivación
Sistema crea referral:
- original_appointment_id = cita actual
- target_specialty_id = ginecología
- status = REQUESTED

appointment original = COMPLETED
4. Gestión por Recepcionista
Recepcionista ve "Derivaciones Pendientes" en Django →
Contacta Dra. Mayra por teléfono → Coordina fecha disponible →
Crea nueva appointment:
- appointment_type = REFERRAL
- time_block según disponibilidad especialista

Actualiza referral:
- new_appointment_id = nueva cita
- status = SCHEDULED

🧪 FLUJO 4: SERVICIOS AUXILIARES (LABORATORIO)
NUEVO MODELO SIMPLIFICADO:
1. Orden Médica
Dr. Mario durante consulta → Indica exámenes necesarios →
Anota en medical_record → Paciente va a recepción
2. Agenda como Nueva Cita
Recepcionista agenda nueva cita →
specialty_id = "Laboratorio" (nueva especialidad) →
time_block según disponibilidad del laboratorio →
Paciente paga servicio de laboratorio
3. Realización y Entrega
Paciente viene en fecha programada → Laboratorio toma muestras →
Procesan resultados → Entregan físicamente →
Paciente puede subir resultados a medical_attachments

📱 FLUJO 5: RECETAS MÉDICAS (NUEVO MODELO)
PROCESO HÍBRIDO:
1. Prescripción Física
Dr. Mario prescribe en papel durante consulta →
Entrega receta física al paciente →
Paciente va a farmacia externa (no tienen farmacia propia)
2. Digitalización Opcional
Paciente fotografía receta → Sube a medical_attachments →
file_type = "PRESCRIPTION", upload_source = "PATIENT" →
Queda guardado en historial digital para futuras consultas

🔧 ADAPTACIÓN A TUS PROYECTOS EXISTENTES
🟠 DJANGO API (Admin/Backoffice) - ADAPTACIONES
RESPONSABILIDADES PRINCIPALES:
1. Gestión de Configuración

✅ CRUD Especialidades: Marcar urología como is_primary, resto como requires_referral
✅ CRUD Doctores: Configurar doctor_type, is_external, can_refer
✅ CRUD Horarios: Gestionar doctor_availability por bloques
✅ CRUD Métodos de Pago: Configurar Yape/Plin como requires_manual_validation

2. Dashboard Operacional

✅ Vista Citas del Día: Por bloques (mañana/tarde) en lugar de horarios específicos
✅ Gestión de Derivaciones: Panel "Derivaciones Pendientes" para recepcionistas
✅ Validación de Pagos: Interface para validar comprobantes Yape/Plin
✅ Métricas Específicas: Utilización por bloques, derivaciones por especialista

3. Gestión de Usuarios

✅ Crear Doctores: Con nuevos campos (doctor_type, is_external, can_refer)
✅ Configurar Especialistas: Doctores bajo demanda con contact_phone
✅ Gestionar Recepcionistas: Rol específico para personal administrativo

MÓDULOS A ADAPTAR EN DJANGO:
Models.py - Nuevas Entidades

✅ Specialty: Agregar is_primary, requires_referral
✅ Doctor: Agregar doctor_type, is_external, can_refer
✅ DoctorAvailability: Cambiar a time_block en lugar de horarios específicos
✅ PaymentMethod: Agregar requires_manual_validation, is_digital
✅ Referral: Nueva entidad completa para derivaciones

Admin.py - Interfaces Administrativas

✅ SpecialtyAdmin: Filtros por is_primary, requires_referral
✅ DoctorAdmin: Formulario con campos nuevos, filtros por type
✅ AppointmentAdmin: Vista por bloques, gestión de derivaciones
✅ ReferralAdmin: Nueva interface para gestionar derivaciones

Views.py - Dashboards Específicos

✅ DashboardView: Métricas por bloques, derivaciones pendientes
✅ ReferralManagementView: Interface para recepcionistas
✅ PaymentValidationView: Validar comprobantes manuales
✅ BlockCapacityView: Control de capacidad por bloque


🟢 SPRING BOOT API (Frontend/Usuarios) - ADAPTACIONES
RESPONSABILIDADES PRINCIPALES:
1. Sistema de Citas por Bloques

✅ AvailabilityService: Calcular disponibilidad por bloques, no por slots
✅ AppointmentService: Validar capacidad máxima por bloque
✅ PriceCalculationService: Obtener precio desde specialty automáticamente

2. Gestión de Pagos Locales

✅ PaymentService: Integrar Yape/Plin APIs
✅ ValidationService: Manejar validaciones manuales
✅ TimeoutService: Cancelar citas no pagadas en 30 min

3. Sistema de Derivaciones

✅ ReferralService: Solo lectura para doctores, creación para Dr. Mario
✅ SpecialtyService: Filtrar especialidades según requires_referral
✅ NotificationService: (Opcional) Avisar derivaciones creadas

MÓDULOS A ADAPTAR EN SPRING BOOT:
Entities - Actualizar Entidades

✅ User: Eliminar department, is_external_doctor
✅ Patient: Eliminar document_type_id, agregar document_number directo
✅ Doctor: Agregar doctor_type, is_external, can_refer
✅ Appointment: Eliminar start_time, agregar time_block
✅ Payment: Eliminar payment_method_type, mantener solo FK

Services - Nueva Lógica de Negocio

✅ AppointmentService:

Reescribir validación de disponibilidad por bloques
Eliminar lógica de slots específicos
Agregar validación de capacidad máxima por bloque


✅ PaymentService:

Integrar APIs de Yape/Plin
Manejar validaciones manuales
Implementar timeouts automáticos


✅ ReferralService: Nueva funcionalidad completa
✅ PriceService: Calcular precios desde specialty

Controllers - Endpoints Adaptados

✅ AppointmentController:

GET /availability → por bloques, no slots
POST /appointments → sin start_time, con time_block


✅ PaymentController:

POST /payments → con métodos locales
GET /payments/validate → para validaciones manuales


✅ ReferralController: Nuevo controller completo


🔄 COMUNICACIÓN ENTRE APIS (SIN HTTP)
COORDINACIÓN POR BASE DE DATOS COMPARTIDA:
Escenario 1: Derivación Completa
1. Spring Boot: Dr. Mario crea referral (status=REQUESTED)
2. Django: Recepcionista ve derivación pendiente
3. Django: Contacta especialista, crea appointment
4. Django: Actualiza referral (status=SCHEDULED, new_appointment_id)
5. Spring Boot: Especialista ve nueva cita asignada
Escenario 2: Validación de Pago
1. Spring Boot: Paciente paga con Yape (status=VALIDATING)
2. Django: Recepcionista ve pago pendiente
3. Django: Valida comprobante, actualiza payment (status=COMPLETED)
4. Spring Boot: Sistema permite acceso a consulta
Escenario 3: Configuración de Especialidades
1. Django: Admin configura specialty (requires_referral=true)
2. Spring Boot: Automáticamente oculta especialidad de booking directo
3. Spring Boot: Solo muestra en derivaciones si can_refer=true

🛡️ VALIDACIONES Y REGLAS DE NEGOCIO
REGLAS CRÍTICAS IMPLEMENTADAS:
1. Control de Acceso a Especialidades

✅ Pacientes solo ven especialidades con requires_referral=false
✅ Doctores solo pueden derivar a especialidades con requires_referral=true
✅ Solo doctores con can_refer=true pueden crear referrals

2. Control de Capacidad

✅ Sistema valida max_patients por bloque antes de agendar
✅ No permite más citas que capacidad configurada
✅ Muestra "Sin disponibilidad" cuando bloque está lleno

3. Control de Pagos

✅ Métodos con requires_manual_validation=true necesitan validación
✅ No se permite acceso a consulta sin payment.status=COMPLETED
✅ Timeouts automáticos para pagos pendientes

4. Integridad de Derivaciones

✅ referral.original_appointment_id debe estar COMPLETED
✅ referral.new_appointment_id debe tener appointment_type=REFERRAL
✅ Solo un referral activo por paciente por especialidad


🎯 BENEFICIOS DEL NUEVO FLUJO
1. Simplicidad Operacional

✅ Bloques vs Slots: 90% menos complejidad en gestión de horarios
✅ Precio Automático: Sin cálculos manuales, desde specialty
✅ Derivaciones Trazables: Historial completo del flujo

2. Específico para Urovital

✅ Especialidad Principal: Urología acceso directo
✅ Especialistas Bajo Demanda: Solo por derivación del urólogo
✅ Pagos Locales: Yape/Plin con validación manual

3. Escalabilidad

✅ Fácil Expansión: Agregar especialidades/doctores simple
✅ Configuración Flexible: hospital_settings para todo
✅ Base Sólida: Para farmacia futura, más servicios