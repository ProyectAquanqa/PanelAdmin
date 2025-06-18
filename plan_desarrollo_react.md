# Plan de Desarrollo Avanzado: Dashboard de Administración (React + Tailwind CSS)

Este documento describe una hoja de ruta detallada para construir un dashboard de administración de alto rendimiento, escalable y con una excelente experiencia de usuario, utilizando un stack moderno de React.

## Fase 1: Fundamentos y Configuración del Proyecto

El objetivo es establecer una base sólida y profesional para el desarrollo.

1.  **Instalar Dependencias Clave**:
    ```bash
    # UI y Estilos
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p

    # Lógica y Utilidades
    npm install axios react-router-dom @headlessui/react @heroicons/react
    npm install react-hook-form @hookform/resolvers zod
    npm install @tanstack/react-query @tanstack/react-table
    npm install framer-motion recharts date-fns react-hot-toast
    ```

2.  **Configurar Tailwind CSS**:
    *   En `tailwind.config.js`, configurar las rutas de los archivos para que Tailwind pueda procesar las clases:
        ```javascript
        content: [
          "./index.html",
          "./src/**/*.{js,ts,jsx,tsx}",
        ],
        ```
    *   En `src/index.css` (o un archivo de estilos global), añadir las directivas de Tailwind:
        ```css
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        ```

3.  **Configurar Variables de Entorno (`.env`)**:
    *   `VITE_API_BASE_URL=http://localhost:8000/api`
    *   `VITE_APP_NAME="Hospital Admin Dashboard"`

4.  **Estructura de Carpetas Detallada (`src`)**:
    ```
    src/
    ├── api/                # Configuración del cliente Axios y lógica de API
    │   └── apiClient.js
    ├── assets/             # Archivos estáticos
    ├── components/         # Componentes UI reutilizables y atómicos
    │   ├── common/         # Botones, Inputs, Modales, Loaders, Data-Display
    │   ├── layout/         # Sidebar, Navbar, PageWrapper
    │   ├── dashboard/      # Gráficos, Tarjetas de KPI
    │   └── ui/             # Componentes base de Headless UI estilizados con Tailwind
    ├── config/             # Configuración de la aplicación (ej. items del sidebar)
    ├── context/            # Contexto de React (Manejo de Autenticación y Tema)
    │   ├── AuthContext.jsx
    │   └── ThemeContext.jsx
    ├── hooks/              # Hooks personalizados (ej. useAuth, useTheme)
    ├── lib/                # Utilidades generales (ej. formateo de fechas)
    ├── pages/              # Componentes de página completos
    │   ├── Auth/
    │   │   └── LoginPage.jsx
    │   ├── DashboardPage.jsx
    │   ├── users/
    │   │   ├── UserListPage.jsx
    │   │   └── UserDetailPage.jsx
    │   └── ...
    ├── providers/          # Proveedores de contexto y librerías (QueryClientProvider)
    │   └── AppProviders.jsx
    ├── routes/             # Configuración de enrutamiento
    │   └── AppRouter.jsx
    ├── services/           # Lógica de fetching de datos (usando React Query)
    └── styles/             # Estilos globales y tema
        └── index.css
    ```

5.  **Crear Cliente API con Interceptor (Axios)**:
    *   En `src/api/apiClient.js`, configurar Axios para usar la URL base y un interceptor que inyecte el token JWT en cada petición, obteniéndolo del `localStorage`.

## Fase 2: Autenticación, Layout y Experiencia de Usuario Base

1.  **Implementar `AuthContext`**:
    *   Gestionará el estado del usuario, token, y las funciones `login`, `logout`.
    *   El `login` llamará al API de Django, y al tener éxito, almacenará el token y redirigirá.
    *   El `logout` limpiará el `localStorage` y redirigirá al login.

2.  **Diseñar el `Layout` con Tailwind CSS**:
    *   Crear un `Sidebar` responsive con los enlaces de navegación (íconos de `Heroicons`).
    *   Crear un `Navbar` con el título de la página, un buscador y el menú de usuario.
    *   Implementar un `ThemeContext` para permitir cambiar entre **modo claro y oscuro**.

3.  **Configurar `React Router` y Rutas Protegidas**:
    *   En `AppRouter.jsx`, definir las rutas públicas (`/login`) y las privadas.
    *   Crear un componente `ProtectedRoute` que use el `AuthContext` para validar el acceso.

4.  **Integrar Proveedores Globales**:
    *   En `App.jsx`, envolver la aplicación con los proveedores necesarios: `QueryClientProvider`, `AuthProvider`, `ThemeProvider`, `Toaster` (de react-hot-toast).

## Fase 3: Módulos de Datos (El Core de la Aplicación)

Para cada módulo (`users`, `doctors`, etc.) se seguirá un patrón consistente y moderno.

1.  **Definir Lógica de Datos con `React Query`**:
    *   Para cada entidad, crear un archivo en `services/` (ej. `userService.js`).
    *   Crear hooks personalizados que encapsulen `useQuery` para obtener datos y `useMutation` para crear, actualizar y eliminar.
        *   **`useGetUsers`**: Hook que usa `useQuery` para obtener la lista de usuarios.
        *   **`useUpdateUser`**: Hook que usa `useMutation` y que, al tener éxito, invalida el query de `useGetUsers` para refrescar los datos automáticamente.

2.  **Construir Página de Listado con `TanStack Table`**:
    *   Usar el hook `useGetUsers` para alimentar la tabla. `React Query` gestionará los estados de carga y error.
    *   Configurar `TanStack Table` para definir columnas, habilitar **ordenamiento global, filtrado y paginación del lado del servidor**.
    *   Diseñar la tabla y sus componentes (celdas, cabeceras) con Tailwind CSS para un look personalizado.
    *   Añadir un botón "Crear" y una columna de "Acciones" (Editar, Eliminar) en cada fila.

3.  **Construir Formularios con `React Hook Form` y `Zod`**:
    *   Crear un `schema` de validación con `Zod` para la entidad.
    *   Usar el hook `useForm` con el `zodResolver` para gestionar el estado y la validación del formulario.
    *   Construir componentes de input reutilizables en `src/components/common/` que se integren con `React Hook Form` para mostrar errores.
    *   Al enviar el formulario, llamar a la mutación correspondiente de `React Query` (ej. `useUpdateUser.mutate()`).

### Desglose de Módulos Prioritarios:

-   **Dashboard Principal (`DashboardPage.jsx`)**:
    -   Utilizar `useQuery` para obtener las métricas del API de `analytics/`.
    -   Mostrar tarjetas de KPI con animaciones sutiles (`Framer Motion`).
    -   Renderizar gráficos con `Recharts`, asegurando que sean responsivos.

-   **Gestión de Usuarios (`/users`)**:
    -   Tabla potente con búsqueda por nombre, email y rol.
    -   Formulario en un modal (usando `Headless UI`) o en una página dedicada (`/users/edit/:id`) para la edición y creación.

-   **Gestión de Doctores y Horarios (`/doctors`)**:
    -   Similar a usuarios, pero con campos específicos como especialidad (un selector) y CMP.
    -   Una interfaz secundaria para gestionar los horarios semanales del doctor.

-   **Auditoría y Catálogos**:
    -   Vistas de solo lectura (para auditoría) y CRUDs simples (para catálogos) siguiendo el mismo patrón de Tabla + Formulario.

## Fase 4: Pulido Final y Despliegue

1.  **Pruebas Integrales**: Revisar todos los flujos de usuario, la responsividad en diferentes dispositivos y el funcionamiento de los modos claro/oscuro.
2.  **Optimización**:
    *   Utilizar `React.lazy` y `Suspense` para dividir el código por rutas (code-splitting), mejorando la carga inicial.
    *   Revisar el rendimiento de las animaciones.
3.  **Build para Producción**:
    *   Ejecutar `npm run build` para generar la carpeta `dist`.
4.  **Estrategia de Despliegue**:
    *   **Opción A (Integrado)**: Configurar Django para servir los archivos estáticos de la carpeta `dist`. Ideal para una gestión unificada.
    *   **Opción B (Separado)**: Desplegar el frontend en una plataforma como Vercel o Netlify, que se integra perfectamente con repositorios de Git y ofrece despliegues continuos. 