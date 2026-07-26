# Backend Turnos y Reservas

Sistema backend para la gestión de servicios, turnos y reservas, desarrollado con Node.js utilizando módulos ESM (ECMAScript Modules). Este proyecto se construye de forma incremental a lo largo del curso de Desarrollo Backend, comenzando con un administrador de servicios persistido en archivos JSON.

## Estado del proyecto

- [x] Módulo 1: Configuración base, ESM, dotenv, ServiceManager (JSON)
- [x] Módulo 2: Servidor con Express y API REST
- [x] Módulo 3: Persistencia con FileSystem
- [ ] Módulo 4: Routers y Controllers
- [ ] Módulo 5: Arquitectura en Capas: DAO y Repository
- [ ] Módulo 6: MongoDB Atlas y Mongoose
- [ ] Módulo 7: Vistas con Handlebars y WebSockets
- [ ] Módulo 8: Consultas Avanzadas, Validación y Populate
- [ ] Módulo 9: Proyecto Final integrador

## Funcionalidades implementadas:

- Configuración base del proyecto con Node.js y ESM
- Gestión segura de variables de entorno con `dotenv` y validación fail-fast
- Servidor Express con API REST para los recursos `services` y `bookings`
- Routers propios (`services.router.js`, `bookings.router.js`) con `express.Router()`, separados de `app.js`
- `ServiceManager`: CRUD completo de servicios, con filtros por query params y validación de datos
- `BookingManager`: creación y consulta de reservas, y asociación de servicios existentes a una reserva
- Persistencia asíncrona en archivos JSON con `fs.promises` (`async`/`await`), sin bloquear el Event Loop
- Manejo de errores centralizado en los métodos privados de lectura/escritura de cada manager

En próximos módulos se incorporarán arquitectura en capas (DAO/Repository), MongoDB con Mongoose, vistas con Handlebars, WebSockets y validaciones avanzadas.

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
git clone https://github.com/leannmeier/CH-Project-Backend_I.git
cd "CH-Project-Backend_I"
npm install
```

## Variables de entorno

El proyecto requiere un archivo `.env` en la raíz con las siguientes variables:

```
PORT=8081
NODE_ENV=development
```

Se incluye un archivo `.env.example` como referencia de las variables necesarias, sin valores reales. Copiar y renombrar antes de ejecutar el proyecto:

```bash
cp .env.example .env
```

La aplicación valida al iniciar que las variables críticas estén presentes. Si falta alguna, el proceso se detiene con un mensaje de error descriptivo (patrón *fail-fast*), evitando que la app arranque en un estado inconsistente.

## Ejecución

```bash
npm start       # ejecuta el proyecto
npm run dev     # ejecuta el proyecto con reinicio automático ante cambios (node --watch)
```
El servidor queda disponible en `http://localhost:<PORT>` (por defecto, `http://localhost:8081`).

## Estructura del proyecto

```
backend-turnos-reservas/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── env.config.js
│   ├── data/
│   │   ├── bookings.json
│   │   └── services.json
│   ├── managers/
│   │   ├── BookingManager.js
│   │   └── ServiceManager.js
│   ├── routes/
│   │   ├── bookings.router.js
|   |   └── services.router.js
│   ├── test/
│   │   ├── 01-test-services-manager.js
│   │   ├── 02-api-services.http
│   │   └── 03-api-bookings.http
│   └── utils/
│       ├── findById.js
│       └── newId.js
|
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Recurso: Services

Un servicio representa una actividad que puede reservarse dentro del sistema de turnos (por ejemplo, un servicio de mantenimiento, estética o diagnóstico).

### Estructura de un servicio

```json
{
  "id": 1,
  "name": "Cambio de aceite y filtros",
  "description": "Reemplazo de aceite de motor y filtros de aceite, aire y combustible.",
  "duration": "1 hora",
  "price": 80,
  "category": "Mantenimiento",
  "available": true
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | Identificador único, generado automáticamente. No se recibe como parámetro ni puede modificarse. |
| `name` | string | Nombre del servicio. |
| `description` | string | Descripción detallada del servicio. |
| `duration` | string | Duración estimada del servicio. |
| `price` | number | Precio del servicio. |
| `category` | string | Categoría a la que pertenece el servicio. |
| `available` | boolean | Indica si el servicio está disponible para reservar. |

La persistencia de los servicios se realiza en `src/data/services.json`.

## Recurso: Bookings

Una reserva representa un turno solicitado por un cliente, con uno o más servicios asociados.

### Estructura de una reserva

```json
{
  "id": 1,
  "clientName": "Juan Pérez",
  "clientEmail": "juanperez@gmail.com",
  "date": "01-01-2026",
  "time": "00:00:01",
  "status": true,
  "services": [
    { "service": 1, "quantity": 1 }
  ]
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | Identificador único, generado automáticamente. |
| `clientName` | string | Nombre del cliente que realiza la reserva. |
| `clientEmail` | string | Email de contacto del cliente. |
| `date` | string | Fecha del turno. |
| `time` | string | Horario del turno. |
| `status` | boolean | Estado de la reserva. |
| `services` | array | Servicios asociados a la reserva. Puede iniciarse vacío. |

Cada entrada de `services` tiene la forma `{ service: idDelServicio, quantity: number }`. Si un servicio ya está asociado a la reserva y se vuelve a agregar, se incrementa `quantity` en vez de crear una entrada duplicada.

La persistencia de las reservas se realiza en `src/data/bookings.json`. La validación de que un servicio exista al asociarlo a una reserva se delega en `ServiceManager`, evitando duplicar la lógica de acceso a `services.json`.


## Endpoints de la API

Todas las respuestas siguen una estructura consistente:

```json
{ "status": "success", "payload": {} }
```

o, en caso de error:

```json
{ "status": "error", "message": "" }
```
### Services

### `GET /api/services`

Devuelve todos los servicios. Acepta filtros opcionales por query params.

| Query param | Ejemplo | Descripción |
|---|---|---|
| `category` | `?category=Mantenimiento` | Filtra por categoría exacta |
| `available` | `?available=true` | Filtra por disponibilidad |

- **200**: `{ "status": "success", "payload": [ /* array de servicios */ ] }`

### `GET /api/services/:sid`

Devuelve un servicio según su `id`.

- **200** si el servicio existe: `{ "status": "success", "payload": { ... } }`
- **404** si no existe: `{ "status": "error", "message": "Servicio no encontrado" }`

### `POST /api/services`

Crea un nuevo servicio. El `id` se genera automáticamente y **no debe incluirse** en el body.

- **201** si se crea correctamente: `{ "status": "success", "payload": { ... } }`
- **400** si faltan campos obligatorios (`name`, `description`, `duration`, `price`, `category`, `available`): `{ "status": "error", "message": "Faltan campos obligatorios: ..." }`

### `PUT /api/services/:sid`

Actualiza un servicio existente. El `id` original no puede modificarse aunque se incluya en el body.

- **200** si el servicio existe: `{ "status": "success", "payload": { ... } }`
- **404** si no existe: `{ "status": "error", "message": "Servicio no encontrado" }`

### `DELETE /api/services/:sid`

Elimina un servicio según su `id`.

- **200** si se elimina correctamente: `{ "status": "success", "payload": { ... } }`
- **404** si no existe: `{ "status": "error", "message": "Servicio no encontrado" }`

### Bookings

#### `POST /api/bookings`

Crea una nueva reserva. El `id` se genera automáticamente. El campo `services` es opcional; si no se envía, la reserva se crea con `services: []`.

```http
POST /api/bookings
Content-Type: application/json

{
  "clientName": "Ana Torres",
  "clientEmail": "anatorres@gmail.com",
  "date": "15-08-2026",
  "time": "10:30",
  "status": true
}
```

- **201** si se crea correctamente: `{ "status": "success", "payload": { ... } }`
- **400** si faltan campos obligatorios: `{ "status": "error", "message": "Faltan campos obligatorios: ..." }`

#### `GET /api/bookings/:bid`

Devuelve una reserva según su `id`.

- **200** si existe: `{ "status": "success", "payload": { ... } }`
- **404** si no existe: `{ "status": "error", "message": "Reserva no encontrada" }`

#### `POST /api/bookings/:bid/services/:sid`

Agrega un servicio existente a una reserva existente. Valida que tanto la reserva como el servicio existan. Si el servicio ya estaba asociado a la reserva, incrementa su `quantity` en vez de duplicar la entrada.

```http
POST /api/bookings/1/services/3
```

- **201** si se asocia correctamente: `{ "status": "success", "payload": { ... /* reserva actualizada */ } }`
- **404** si la reserva o el servicio no existen: `{ "status": "error", "message": "Reserva no encontrada" }` o `{ "status": "error", "message": "Servicio no encontrado" }`

## Cómo probar la API

Se puede probar con cualquier cliente HTTP: [Postman](https://www.postman.com/), [Thunder Client](https://www.thunderclient.com/) (extensión de VS Code) o la extensión [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client), usada durante el desarrollo de este proyecto Los archivos de prueba usados se 
encuentran en `src/test/`.

Ejemplo de archivo `.http` para REST Client:
```http
### obtener una reserva por su id
GET http://localhost:8081/api/bookings/6

### Buscamos una reserva que no exista
GET http://localhost:8081/api/bookings/90

### crear una nueva reserva
POST http://localhost:8081/api/bookings
Content-Type: application/json;

{
    "clientName": "Lionel Messi",
    "clientEmail": "leomessi10@gmail.com",
    "date": "06-24-1987",
    "time": "00:00:06",
    "status": "Confirmada",
    "services": []
}
```

## Tecnologías utilizadas

- Node.js (ESM)
- Express
- dotenv

## Autor

Meier Leandro Agustín - Analista de Sistemas
