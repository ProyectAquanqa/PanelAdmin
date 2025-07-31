# Directrices de Desarrollo - PanelAdmin

Este documento define la arquitectura, patrones de diseño, y convenciones a seguir en el desarrollo del proyecto `PanelAdmin`. El objetivo es mantener un código limpio, coherente, escalable y fácil de mantener.

## 1. Principios Generales

- **Coherencia sobre preferencia:** Seguir los patrones aquí definidos aunque se tenga una preferencia personal por otro enfoque.
- **Sencillez (KISS):** Mantener las soluciones lo más simples posible.
- **No repetir (DRY):** Reutilizar código a través de componentes y hooks.

## 2. Arquitectura Frontend (React)

### 2.1. Estructura de Directorios

La estructura de `src` está organizada por funcionalidad para mantener el código desacoplado y localizable.

-   **/api**: Configuraciones de instancias de `axios` o clientes API.
-   **/assets**: Archivos estáticos como imágenes, fuentes, etc.
-   **/components**: Componentes React reutilizables.
    -   **/components/common**: Componentes genéricos (botones, inputs, modales).
    -   **/components/Layout**: Componentes de estructura principal (Header, Sidebar, Footer).
    -   **/components/Auth**: Componentes específicos para autenticación.
-   **/context**: Proveedores de Contexto de React para el estado global.
-   **/hooks**: Hooks personalizados de React (`useAuth`, `useApi`, etc.).
-   **/pages**: Componentes que representan páginas completas de la aplicación (mapeados a rutas).
-   **/providers**: Proveedores de alto nivel (React Query, Tema, etc.).
-   **/routes**: Definición y configuración de rutas (`react-router-dom`).
-   **/services**: Lógica de comunicación con APIs externas. Cada servicio agrupa endpoints de un recurso (e.g., `authService.js`).
-   **/utils**: Funciones de utilidad puras y genéricas (formateo de fechas, validaciones, etc.).

### 2.2. Componentes

-   **Componentes Funcionales:** Todos los componentes deben ser funcionales y usar hooks.
-   **Separación de Lógica y UI:**
    -   Los componentes deben centrarse en la renderización de la UI.
    -   La lógica compleja (manejo de estado, efectos, llamadas a API) debe extraerse a **Hooks personalizados**.
-   **PropTypes:** Todos los componentes deben tener sus `propTypes` definidas para la validación de props en desarrollo.

### 2.3. Manejo de Estado

-   **Estado Local:** Para estado que solo afecta a un componente, usar `useState`.
-   **Estado Compartido:** Para estado que necesita ser compartido entre varios componentes, usar `useContext` junto con `useReducer`.
-   **Estado del Servidor (Server State):** Para manejar datos de la API (caching, re-fetching, etc.), se utilizará una librería como `React Query` o `SWR` en el futuro. Por ahora, se gestionará en la carpeta `/services`.

### 2.4. Estilado (Styling)

-   **Framework Principal:** Se utiliza **Tailwind CSS** para todo el estilado.
-   **Color Principal:** El color de acento principal de la aplicación es `#2D728F`. Todos los elementos interactivos primarios deben usar este color o derivados.
-   **Estilos Globales:** Estilos base y clases personalizadas de bajo nivel se definen en `src/index.css`.
-   **Componentes Estilizados:** No se utilizará `styled-components` o `emotion` para mantener la coherencia con Tailwind.

### 2.5. Ruteo

-   **Librería:** Se utiliza `react-router-dom`.
-   **Definición de Rutas:** Todas las rutas de la aplicación se centralizan en `src/routes/AppRoutes.jsx`.
-   **Carga Perezosa (Lazy Loading):** Todas las páginas (`/pages`) deben cargarse de forma perezosa usando `React.lazy()` y `Suspense` para optimizar la carga inicial.

## 3. Límites y Reglas de Seguridad ("Safety Rails")

-   **Variables de Entorno:** Todas las claves de API, URLs de backend y secretos deben estar en un archivo `.env` y no deben ser subidas al repositorio.
-   **Interacción con API:** Nunca se debe consumir un endpoint de tipo `DELETE` o que realice cambios masivos sin una confirmación explícita por parte del usuario en la UI.
-   **No Código Backend en Frontend:** No incluir lógica de negocio sensible o que deba ejecutarse en el servidor. El frontend es solo una capa de presentación.

## 4. Manejo de Errores y Feedback al Usuario

Una experiencia de usuario robusta depende de cómo la aplicación gestiona y comunica los estados de carga, éxito y error.

### 4.1. Estados de Carga

-   **Carga Inicial de Página/Ruta:** Utilizar el componente `Suspense` de React con un componente `Spinner` o `Loader` a pantalla completa.
-   **Carga de Datos dentro de un Componente:** Para componentes que cargan sus propios datos, mostrar un indicador de carga local (un `Spinner` más pequeño o `Skeleton loaders`) para no bloquear toda la UI.
-   **Acciones en Botones:** Al enviar un formulario, el botón debe entrar en estado `disabled` y mostrar un texto como "Guardando..." junto a un ícono de carga para evitar envíos duplicados.

### 4.2. Notificaciones (Toasts)

-   **Librería Estándar:** Se utilizará `react-hot-toast` para todas las notificaciones flotantes.
-   **Uso:**
    -   **Éxito:** Tras una operación exitosa (e.g., `toast.success('¡Evento guardado con éxito!')`).
    -   **Error:** Cuando una operación de API falla y el error no se muestra directamente en un campo de formulario. Se debe usar el `message` del objeto `error` de la API (e.g., `toast.error(error.response.data.error.message)`).

### 4.3. Errores de Formulario

-   Para errores de validación devueltos por la API (código 422), los mensajes de error deben mostrarse directamente debajo de cada campo de formulario correspondiente.
-   La lógica del formulario debe mapear el objeto `details` de la respuesta de error de la API al estado de error de cada campo.

### 4.4. Errores Críticos (Fallback)

-   **Límite de Errores (Error Boundary):** La aplicación debe estar envuelta en un `Error Boundary` de React. Si ocurre un error de renderizado irrecuperable en cualquier parte del árbol de componentes, este mostrará una página de error genérica en lugar de una pantalla en blanco, permitiendo al usuario recargar la página.
-   **Errores de Red y Servidor (5xx):** Si una petición a la API falla con un error 5xx, se debe mostrar una notificación (`toast`) con un mensaje genérico como "Error de conexión con el servidor. Por favor, inténtalo de nuevo más tarde." 