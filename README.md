# GAIA CRM — Frontend

Interfaz de usuario del sistema CRM/Pipeline de GAIA CONSULTORES, construida con React, TypeScript y Vite. Permite gestionar clientes, proyectos, procesos comerciales, consultores, herramientas RPA y más, a través de un flujo de trabajo visual por etapas.

---

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución en desarrollo](#instalación-y-ejecución-en-desarrollo)
- [Build para producción](#build-para-producción)
- [Despliegue con Docker](#despliegue-con-docker)
- [Módulos del sistema](#módulos-del-sistema)
- [Arquitectura de componentes](#arquitectura-de-componentes)
- [Contextos globales](#contextos-globales)
- [Sistema de caché y comunicación con el backend](#sistema-de-caché-y-comunicación-con-el-backend)
- [Control de acceso por roles (RBAC)](#control-de-acceso-por-roles-rbac)
- [Chatbot GAIA IA](#chatbot-gaia-ia)
- [Convenciones de código](#convenciones-de-código)

---

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18 | UI declarativa basada en componentes |
| TypeScript | 5 | Tipado estático |
| Vite | 5 | Bundler y servidor de desarrollo |
| Axios | 1.x | Cliente HTTP con interceptores |
| Lucide React | 0.383 | Iconografía |
| CSS Custom Properties | — | Sistema de diseño con variables

No se usa ningún framework de estilos externo (sin Tailwind, sin Bootstrap). Todo el diseño se gestiona a través de un sistema de variables CSS propio definido en `src/Styles/`.

---

## Estructura del proyecto

```
src/
├── Components/          # Componentes reutilizables globales
├── Connection/          # Configuración de Axios
├── Constants/           # Constantes tipadas del dominio 
├── Context/             # Contextos React globales (Auth, etc.)
├── Hooks/               # Custom hooks reutilizables
├── Interfaces/          # Tipos e interfaces TypeScript
├── Pages/               # Páginas principales del sistema
│   ├── Clientes/
│   ├── Consultores/
│   ├── Procesos/        # Módulo principal: Pipeline + Wizard
│   │   ├── components/  # Subcomponentes del wizard y panel
│   │   ├── service/     # Adaptadores de servicio por etapa
│   │   ├── Creacion.tsx
│   │   ├── Levantamiento.tsx
│   │   ├── EtapaEstimacion.tsx
│   │   ├── Propuesta.tsx
│   │   ├── Aprobacion.tsx
│   │   ├── Aprobado.tsx
│   │   ├── EtapaEjecucion.tsx
│   │   ├── EtapaCierre.tsx
│   │   ├── EtapaFacturado.tsx
│   │   ├── EtapaRechazado.tsx
│   │   ├── EtapaStandBy.tsx
│   │   ├── PipelineView.tsx
│   │   ├── WizardContext.tsx
│   │   └── Procesos.tsx
│   ├── Tickets/
│   ├── Licencias/
│   └── Dashboard/
├── Services/            # Servicios HTTP por entidad
├── Styles/              # CSS global y variables de diseño
└── Utils/               # Funciones utilitarias
```

---

## Requisitos previos

- Node.js **20 LTS** o superior
- npm 9+
- El backend de GAIA CRM corriendo y accesible
---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto copiando `.env.example`:

```bash
cp .env.example .env
```

Contenido de `.env.example`:

```env
# URL base del backend 
VITE_API_URL=http://localhost:4000/api
```

> En producción este valor debe apuntar al dominio o IP del servidor donde corre el backend.

---

## Instalación y ejecución en desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (hot reload)
npm run dev
```

La aplicación queda disponible en `http://localhost:5173` por defecto.

---

## Build para producción

```bash
npm run build
```

Genera la carpeta `dist/` con los archivos estáticos optimizados listos para ser servidos por Nginx u otro servidor web.

Para previsualizar el build localmente:

```bash
npm run preview
```

## Módulos del sistema

### Pipeline / Procesos
Núcleo del sistema. Vista de tres columnas: **Clientes → Proyectos → Procesos**. Cada proceso tiene un wizard de 11 etapas:

| Paso | Etapa | Descripción |
|---|---|---|
| 1 | Creación | Datos base del proceso: proyecto, clasificación, herramientas RPA |
| 2 | Levantamiento | Consultores, fecha, observaciones y próximos pasos |
| 3 | Estimación | Volúmenes transaccionales, requerimientos de IA/OCR/Captcha/IDP |
| 4 | Propuesta | Valor presupuestado, horas, gerencia, hitos de pago y costos recurrentes |
| 5 | Aprobación | Reunión preliminar y resolución de aprobación/rechazo |
| 6 | Aprobado | Registro formal de la aprobación |
| 7 | Ejecución | Fechas de inicio/fin y seguimiento |
| 8 | Cierre | Horas reales ejecutadas y entregables finales |
| 9 | Facturado | Ítems de factura con fechas de vencimiento y estado de cobro |
| 10 | Rechazado | Motivo, categoría, recuperabilidad y fecha de recontacto |
| 11 | Stand By | Motivo de pausa, condición de reactivación y fecha estimada de retorno |

Cada etapa soporta **interacciones** (historial de reuniones/llamadas) y actualiza el estado del proceso en tiempo real.

### Clientes
CRUD completo con soporte para múltiples contactos por cliente (`SeguimientoContacto`), tarifas diferenciadas por tipo de proyecto (desarrollo, cambio, soporte) y seguimiento comercial.

### Consultores
Gestión de perfiles, estado activo/inactivo y asignación de vistas/módulos permitidos (control de acceso granular).

### Herramientas RPA
Catálogo de herramientas.

### Tickets de Soporte
Registro y seguimiento de incidencias por cliente y proyecto.

### Licencias de Software
Control de licencias activas, vencimientos y costos recurrentes por cliente.

### Dashboard
Métricas comerciales y operativas. Integración con Power BI para reportería avanzada.

---

## Arquitectura de componentes

### WizardContext (`Pages/Procesos/WizardContext.tsx`)
Contexto global que provee catálogos precargados a todos los componentes del wizard:

```
WizardProvider
├── clientes[]          ← clienteService.getAll()
├── consultores[]       ← consultorService.getAll({ activo: true })
├── herramientas[]      ← herramientaService.getAll({ activo: true })
├── estados[]           ← estadoService.getAll()
├── roles[]             ← rolService.getAll()
└── fetchProyectosByCliente(clienteId) → ProyectoSummary[]
                        ← pipelineService.getProyectos()  [on-demand + caché Redis]
```

> Los proyectos **no** se cargan globalmente. Se fetchean on-demand por cliente usando el pipeline service, que tiene caché en Redis del lado del backend. Esto evita cargar cientos de proyectos innecesariamente.

### PipelineView (`Pages/Procesos/PipelineView.tsx`)
Vista de tres columnas con carga lazy por nivel:
- **PanelClientes** — carga al montar
- **PanelProyectos** — carga al seleccionar un cliente
- **PanelProcesos** — carga al seleccionar un proyecto

## Contextos globales

### AuthContext
Gestiona la sesión del usuario: token JWT, datos del consultor autenticado (nombre, roles, vistas permitidas, tokens).

Expone:
- `user` — datos del usuario autenticado
- `login(token)` — inicia sesión
- `logout()` — cierra sesión
---

## Sistema de caché y comunicación con el backend

El backend implementa caché con Redis. Las claves relevantes para el frontend son:

| Endpoint | Clave Redis | TTL |
|---|---|---|
| `GET /pipeline/clientes` | `clientes:resumen`|
| `GET /pipeline/clientes/:id/proyectos` | `cliente:{id}:proyectos` | 
| `GET /pipeline/proyectos/:id/procesos` | `proyecto:{id}:procesos` | 

Cualquier mutación (crear, editar o eliminar proceso/proyecto) invalida automáticamente las claves afectadas en el backend. El frontend no necesita gestionar caché propio; basta con que el `refreshSignal` cambie para que los paneles refresquen y obtengan datos actualizados.

---

## Control de acceso por roles (RBAC)

Cada consultor tiene un array `vistas` en su perfil (almacenado en la tabla `consultores` de la base de datos e incluido en el JWT). El frontend lo utiliza para filtrar los ítems del sidebar:

```ts
// Ejemplo de uso
const puedeVer = (vista: string): boolean =>
  user?.vistas?.includes(vista) ?? false;
```

Las vistas disponibles se administran desde el módulo de Consultores. Si un consultor no tiene una vista en su array, el ítem del sidebar no aparece y la ruta queda inaccesible.

---

## Chatbot GAIA IA

Componente `ChatBot.tsx` integrado en el layout global. Características:

- **Proveedor primario:** DeepSeek API
- **Fallback automático:** Claude (Anthropic) si DeepSeek falla
- El campo `providerUsado` en la respuesta indica qué proveedor resolvió la consulta
- El estado de tokens se sincroniza en tiempo real desde `AuthContext`
---