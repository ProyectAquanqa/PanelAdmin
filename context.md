# Contexto del Proyecto: PanelAdmin + AquanQ

Este documento proporciona una visión detallada de la arquitectura, componentes y propósito de los proyectos `PanelAdmin` (frontend) y `AquanQ` (backend).

## 1. Resumen General

El proyecto consiste en una aplicación web completa:

*   **`AquanQ`**: Es el **backend** de la aplicación, desarrollado en **Django** y **Django Rest Framework**. Se encarga de toda la lógica de negocio, gestión de datos, autenticación de usuarios y de exponer una API REST para ser consumida.
*   **`PanelAdmin`**: Es el **frontend**, una **Single Page Application (SPA)** construida con **React**. Funciona como un panel de administración para interactuar con los datos y servicios que provee el backend `AquanQ`.

El objetivo principal parece ser la administración de `Eventos`, `Noticias` y posiblemente un `Chatbot` con su base de conocimiento, junto con la gestión de usuarios del sistema.

## 2. Arquitectura General y Comunicación

La arquitectura es de tipo **cliente-servidor desacoplada**:

```mermaid
graph TD
    A[Usuario] --> B{PanelAdmin (React)};
    B --> C{API REST (AquanQ)};
    C --> D[Base de Datos (PostgreSQL/SQLite)];

    subgraph "Frontend (Navegador)"
        B
    end

    subgraph "Backend (Servidor)"
        C
        D
    end
```

1.  El **frontend (`PanelAdmin`)** se ejecuta en el navegador del usuario.
2.  Cuando el usuario realiza una acción (ej. crear un evento), el frontend realiza una petición HTTP a la **API REST** expuesta por el **backend (`AquanQ`)**.
3.  El backend procesa la petición, aplica la lógica de negocio (crea el evento en la base de datos, envía notificaciones, etc.) y devuelve una respuesta en formato JSON.
4.  El frontend recibe la respuesta y actualiza la interfaz de usuario para reflejar el cambio.

## 3. Proyecto `AquanQ` (Backend - Django)

Basado en las directrices de desarrollo (`DEVELOPMENT_GUIDELINES.md`), este es un proyecto Django muy bien estructurado que sigue las mejores prácticas.

### 3.1. Propósito y Funcionalidades

`AquanQ` es el cerebro de la aplicación. Gestiona los datos y la lógica de negocio a través de diferentes módulos (apps de Django):

*   **`users`**: Manejo de usuarios, perfiles, autenticación y autorización.
*   **`eventos`**: CRUD (Crear, Leer, Actualizar, Borrar) para eventos. Parece tener categorías, fechas, autores, etc.
*   **`chatbot`**: Funcionalidad de un chatbot, que probablemente consulta una base de conocimiento (`ChatbotKnowledgeBase`). Incluye comandos para generar embeddings, lo que sugiere el uso de IA o búsqueda semántica.
*   **`notificaciones`**: Sistema para enviar notificaciones (posiblemente push) a los usuarios.
*   **`core`**: Probablemente contiene la lógica y modelos base compartidos por el resto de las aplicaciones.

### 3.2. Arquitectura Interna

La arquitectura sigue un patrón de **Vistas Delgadas y Servicios Inteligentes**:

*   **`models.py`**: Define la estructura de la base de datos. Es la fuente de la verdad.
*   **`views.py`**: Expone los endpoints de la API. Su única responsabilidad es recibir peticiones, llamar a un servicio y devolver una respuesta. **No contiene lógica de negocio**.
*   **`services.py`**: **El corazón de la lógica de negocio**. Orquesta las operaciones (ej. `crear_evento(data)`). No interactúa directamente con HTTP.
*   **`serializers.py`**: Valida y transforma los datos entre el formato JSON de la API y los objetos de Python/Django.
*   **`permissions.py`**: Define reglas de acceso personalizadas para los endpoints.

### 3.3. Contrato de la API

La comunicación con el frontend se realiza a través de una API REST versionada (`/api/v1/...`). Las respuestas siguen un formato estándar y predecible para éxitos y errores, lo que facilita la integración con el frontend. (Ver `DEVELOPMENT_GUIDELINES.md` para detalles exactos del formato JSON).

## 4. Proyecto `PanelAdmin` (Frontend - React)

Es la interfaz de usuario para administrar la plataforma.

### 4.1. Tecnologías

*   **React**: Biblioteca principal para construir la interfaz.
*   **Vite**: Herramienta de construcción y servidor de desarrollo rápido.
*   **TailwindCSS**: Framework de CSS para el diseño.
*   **React Router**: Para gestionar las rutas de la aplicación (navegación).

### 4.2. Estructura de Carpetas y Flujos

La estructura es típica de una aplicación React moderna:

*   **`src/pages`**: Contiene los componentes de página principal (ej. `Login.jsx`, `Dashboard.jsx`). Cada página representa una vista principal de la aplicación.
*   **`src/components`**: Contiene componentes reutilizables (botones, formularios, layout, etc.). La separación de componentes como `Auth/LoginForm.jsx` y `Sidebar/Sidebar.jsx` indica una buena componentización.
*   **`src/routes`**: Define cómo las URLs se mapean a las páginas. `AppRoutes.jsx` es el punto central de enrutamiento.
*   **`src/context`**: Manejo del estado global. `AuthContext.jsx` es crucial, ya que gestiona el estado de autenticación del usuario (si está logueado, sus datos, el token JWT, etc.).
*   **`src/api`**: (Suposición basada en el nombre) Probablemente contiene las funciones para realizar las llamadas a la API del backend `AquanQ`, posiblemente usando `axios` o `fetch`. [[memory:4371436]]
*   **`src/hooks`**: Hooks personalizados de React (ej. `useAuth`) para encapsular lógica y hacerla reutilizable.

### 4.3. Flujo de Autenticación

1.  El usuario llega a `LoginPage.jsx`.
2.  Ingresa sus credenciales en `LoginForm.jsx`.
3.  Al enviar, se llama a una función (probablemente en `src/api`) que hace un `POST` al endpoint de login de `AquanQ`.
4.  Si las credenciales son válidas, `AquanQ` devuelve un token (probablemente JWT).
5.  `AuthContext.jsx` almacena este token (en memoria y/o `localStorage`) y actualiza el estado de la aplicación a "autenticado".
6.  La aplicación redirige al usuario a una ruta protegida, como el `Dashboard`, usando el `AdminLayout.jsx` que incluye el `Header` y `Sidebar`.

## 5. Preguntas y Áreas para Profundizar

Como mencionaste, puedo detallar más si me das más información. Aquí hay algunas áreas que podríamos expandir:

*   **Flujo de Eventos**: ¿Cómo es el ciclo de vida completo de un evento? (Creación, aprobación, publicación, etc.)
*   **Funcionalidad del Chatbot**: ¿Cómo funciona exactamente? ¿Usa un servicio externo como OpenAI, o es un modelo propio? ¿Cómo se entrena y se consulta?
*   **Sistema de Notificaciones**: ¿Qué eventos disparan notificaciones y a través de qué canales se envían (email, push notifications)?
*   **Roles y Permisos**: ¿Existen diferentes roles de usuario (Admin, Editor, Usuario normal) y qué puede hacer cada uno tanto en el panel como en la API?
*   **Despliegue (Deployment)**: ¿Cómo se despliegan ambos proyectos? (Docker, Vercel, AWS, etc.)

Este documento sirve como un punto de partida. ¡No dudes en pedirme que lo modifique o añada más secciones! 