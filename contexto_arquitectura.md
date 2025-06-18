# Contexto de Arquitectura para el Dashboard de Administración (React)

Este documento resume el entorno técnico y los puntos de integración clave para el desarrollo del frontend del panel de administración. El objetivo es alinear el desarrollo de React con los backends existentes de Django y Spring Boot.

## 1. Visión General del Ecosistema

El sistema completo se compone de dos grandes áreas funcionales, cada una con su propio stack tecnológico, compartiendo una única base de datos.

-   **Área de Usuario/Paciente (Cliente Principal)**:
    -   **Backend**: API REST con **Spring Boot** (`hospital_main`).
    -   **Función**: Gestiona la lógica de negocio orientada al paciente y al doctor (citas, historiales clínicos, notificaciones, etc.).
    -   **Frontends (Consumidores)**: App móvil (Kotlin) y App Web (React).

-   **Área de Administración y Auditoría**:
    -   **Backend**: API REST con **Django** (`hospital_admin`).
    -   **Función**: Gestiona la administración de la plataforma, usuarios, roles, reportes, métricas de rendimiento y auditoría.
    -   **Frontend (A desarrollar)**: Dashboard de Administración con **React** (`hospital_dashboard`).

## 2. Puntos Clave de Integración con el Backend (Django)

El dashboard de React interactuará **exclusivamente** con el API REST expuesta por el proyecto **Django (`hospital_admin`)**.

-   **Endpoint del API**: `http://localhost:8000/api/` (configurable).
-   **Autenticación**: Vía **JWT (JSON Web Tokens)**.
    -   El frontend deberá solicitar un token en el login.
    -   El token deberá ser enviado en la cabecera `Authorization` de cada petición subsiguiente (Ej: `Authorization: Bearer <token>`).
    -   Se debe implementar la lógica para almacenar de forma segura el token (en `localStorage` o `sessionStorage`) y gestionar su expiración y renovación.
-   **Endpoints Principales a Consumir** (mapeados desde las `apps` de Django):
    -   `authentication/`: Login y gestión de tokens.
    -   `users/`: CRUD de usuarios (pacientes, doctores, administradores).
    -   `doctors/`: Gestión de perfiles de doctores, especialidades y horarios.
    -   `analytics/`: Obtención de datos para métricas y gráficos del dashboard.
    -   `audit/`: Visualización de logs de auditoría.
    -   `payments/`: Consulta de información financiera.
    -   `catalogs/`: Gestión de datos maestros (ej. tipos de documentos, especialidades).

## 3. Base de Datos Compartida (PostgreSQL)

-   Aunque el frontend no interactúa directamente con la base de datos, es crucial entender que ambos backends operan sobre la misma base de datos `db_hospital`.
-   Las acciones realizadas en el panel de administración (ej. crear un doctor) se reflejarán inmediatamente en el sistema principal (Spring Boot) y viceversa.
-   Esto garantiza la **consistencia de datos** en toda la plataforma.

## 4. Stack Tecnológico del Frontend

-   **Framework**: React 19
-   **Build Tool**: Vite
-   **Lenguaje**: JavaScript (JSX)
-   **Styling**: Se recomienda usar un framework de UI como **Material-UI** o **Ant Design** para acelerar el desarrollo y mantener la consistencia visual.
-   **Peticiones HTTP**: Se usará **Axios** para las llamadas al API de Django.
-   **Enrutamiento**: Se implementará con **React Router DOM**.
-   **Manejo de Estado**: Se utilizará **Context API** de React para gestionar el estado global (ej. autenticación del usuario). 