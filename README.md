# Backend Turnos y Reservas

Sistema backend para la gestión de servicios, turnos y reservas, desarrollado con Node.js utilizando módulos ESM (ECMAScript Modules), persistencia en MongoDB Atlas mediante Mongoose, vistas del lado del servidor con Handlebars, comunicación en tiempo real con Socket.io, y consultas avanzadas con validación de datos mediante Zod. Este proyecto se construye de forma incremental a lo largo del curso de Desarrollo Backend.

## Estado del proyecto

- [x] Módulo 1: Configuración base, ESM, dotenv, ServiceManager (JSON)
- [x] Módulo 2: Servidor con Express y API REST
- [x] Módulo 3: Persistencia asíncrona con FileSystem, recurso Bookings
- [x] Módulo 4: Organización en routes, controllers y managers
- [x] Módulo 5: Arquitectura en capas (services, repositories, DAO)
- [x] Módulo 6: Migración a MongoDB Atlas con Mongoose
- [x] Módulo 7: Vistas con Handlebars y comunicación en tiempo real con Socket.io
- [x] Módulo 8: Consultas avanzadas, validación con Zod y populate
- [ ] Módulo 9: Proyecto Final integrador

## Funcionalidades implementadas

- Configuración base del proyecto con Node.js (v20+) y ESM
- Gestión segura de variables de entorno con `dotenv` y validación fail-fast
- Servidor Express con API REST para los recursos `services` y `bookings`
- Arquitectura en capas: routes → controllers → services → repositories → DAO, con responsabilidades separadas
- Persistencia en MongoDB Atlas mediante Mongoose, con conexión validada bajo el patrón fail-fast
- `GET /api/services` con filtros, paginación y ordenamiento configurables por query params, devolviendo metadata completa de paginación
- Validación de datos de entrada con Zod, aplicada como middleware antes de que la petición llegue a la capa de negocio, en la creación y actualización de servicios, la creación de reservas y la asociación de un servicio a una reserva
- Referencia entre `bookings` y `services` mediante `ObjectId`, con `populate` en las consultas de lectura destinadas a mostrarse
- Vistas del lado del servidor con Handlebars, alimentadas por la misma arquitectura en capas que la API REST
- Comunicación en tiempo real con Socket.io: al actualizar la disponibilidad de un servicio, la vista `/views/availability` se actualiza sin recargar la página
- Manejo de errores en dos niveles: validación de forma con Zod (antes de la persistencia) y middleware de errores centralizado que distingue errores de datos inválidos de errores internos

En el próximo módulo se realizará la integración final del proyecto.

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
git clone https://github.com/leannmeier/CH-Project-Backend_I.git
cd "CH-Project-Backend_I"
npm install
```

Requiere Node.js v20 o superior.

## Variables de entorno

El proyecto requiere un archivo `.env` en la raíz con las siguientes variables:

```
PORT=8081
NODE_ENV=development
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/booking_system
```

Se incluye un archivo `.env.example` como referencia de las variables necesarias, sin valores reales. Copiar y renombrar antes de ejecutar el proyecto:

```bash
cp .env.example .env
```

`MONGO_URI` corresponde a un cluster de [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Es necesario habilitar el acceso a la IP correspondiente desde *Network Access* en el panel de Atlas.

## Ejecución

```bash
npm start       # ejecuta el proyecto
npm run dev     # ejecuta el proyecto con reinicio automático ante cambios (node --watch)
```

El servidor queda disponible en `http://localhost:<PORT>` (por defecto, `http://localhost:8081`). Al iniciar, valida la conexión a MongoDB antes de aceptar peticiones.

## Arquitectura del proyecto

```
Cliente → Router → [Middleware de validación] → Controller → Service → Repository → DAO → MongoDB (Mongoose)
```

| Capa | Responsabilidad |
|---|---|
| **routes/** | Define los endpoints disponibles (API y vistas) y aplica los middlewares de validación correspondientes antes de llegar al controller. |
| **middlewares/validationSchema.js** | `validateBody` y `validateParams`: validan `req.body` o `req.params` contra un schema de Zod. Si los datos no cumplen el schema, responde `400` sin llegar a ejecutar el controller. |
| **validations/** | Define los schemas de Zod para cada recurso (`services.validation.js`, `bookings.validation.js`), separados de las rutas y de los modelos. |
| **controllers/** | Recibe la petición ya validada, llama al service correspondiente y responde al cliente. |
| **services/** | Contiene la lógica de negocio: construcción de filtros/paginación/ordenamiento, validación de campos obligatorios (como capa de seguridad adicional a Zod), la regla de `quantity` incremental, y la emisión de eventos de Socket.io. |
| **repositories/** | Ofrece métodos de acceso a datos, independientes de Mongoose. |
| **dao/mongo/** | Interactúa directamente con MongoDB a través de los modelos de Mongoose (`.find()`, `.skip()`, `.limit()`, `.sort()`, `.countDocuments()`, `.populate()`). Es la única capa que conoce la existencia de Mongoose. |
| **dao/models/** | Define los Schemas y Models de Mongoose. |

### Validación vs. lógica de negocio

Zod valida la **forma** de los datos (¿existe el campo?, ¿es del tipo correcto?, ¿el email tiene formato válido?) antes de que la petición llegue al controller. La **lógica de negocio** (¿existe el servicio?, ¿existe la reserva?, ¿hay que incrementar `quantity`?) sigue viviendo en la capa `services/`, ya que requiere consultar la base de datos y no puede resolverse solo con la forma del dato. Por ejemplo, `bookingParamsSchema` valida que `sid` tenga el formato de un `ObjectId`, pero no puede saber si ese servicio existe realmente: esa verificación la sigue haciendo `bookings.service.js` consultando `services.service.js`.

La validación manual de campos obligatorios que ya existía en `services.service.js` y `bookings.service.js` se mantiene como capa de seguridad adicional, del mismo modo que el `required: true` de los modelos de Mongoose: Zod corta el flujo antes, pero estas capas siguen protegiendo el sistema ante cualquier llamada que no pase por las rutas HTTP.

### Filtros, paginación y ordenamiento

La construcción del filtro, el cálculo de `skip` y la metadata de paginación se resuelven en `services.service.js`. El DAO (`service.mongo.dao.js`) es la única capa que aplica `.skip()`, `.limit()` y `.sort()` directamente sobre la consulta de Mongoose, y usa `.countDocuments()` para obtener el total de resultados sin traer todos los documentos.

### Populate

`booking.mongo.dao.js` expone dos formas de obtener una reserva por id: una sin poblar (usada al escribir, para no operar sobre un documento con referencias resueltas) y otra con `populate('services.service')` (usada exclusivamente en `GET /api/bookings/:bid`, la consulta de lectura destinada a mostrarse al cliente).

## Estructura del proyecto

```
backend-turnos-reservas/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── env.config.js
│   │   ├── database.config.js
│   │   └── socket.config.js
│   ├── controllers/
│   │   ├── services.controller.js
│   │   ├── bookings.controller.js
│   │   └── views.controller.js
│   ├── validations/
│   │   ├── services.validation.js
│   │   └── bookings.validation.js
│   ├── dao/
│   │   ├── models/
│   │   │   ├── service.model.js
│   │   │   ├── booking.model.js
│   │   │   └── message.model.js
│   │   └── mongo/
│   │       ├── service.mongo.dao.js
│   │       ├── booking.mongo.dao.js
│   │       └── message.mongo.dao.js
│   ├── middlewares/
│   │   ├── errorHandler.js
│   │   └── validationSchema.js
│   ├── repositories/
│   │   ├── services.repository.js
│   │   └── bookings.repository.js
│   ├── routes/
│   │   ├── services.router.js
│   │   ├── bookings.router.js
│   │   └── views.router.js
│   ├── services/
│   │   ├── services.service.js
│   │   └── bookings.service.js
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.handlebars
│   │   ├── services.handlebars
│   │   └── availability.handlebars
│   ├── public/
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       └── socket.js
│   ├── test/
│   └── utils/
│       └── asyncHandler.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Recurso: Services

### Estructura de un servicio

```json
{
  "_id": "6a713c86f480932c18771a02",
  "name": "Cambio de aceite y filtros",
  "description": "Reemplazo de aceite de motor y filtros de aceite, aire y combustible.",
  "duration": "1 hora",
  "price": 80,
  "category": "Mantenimiento",
  "available": true,
  "createdAt": "2026-08-04T01:13:08.906Z",
  "updatedAt": "2026-08-04T01:13:08.906Z"
}
```

La persistencia de los servicios se realiza en la colección `services` de MongoDB.

## Recurso: Bookings

### Estructura de una reserva

```json
{
  "_id": "6a7359b65c8734f64ff4d6d7",
  "clientName": "Cosme Fulanito",
  "clientEmail": "cosmefulanito@gmail.com",
  "date": "12-31-2025",
  "time": "00:00:05",
  "status": true,
  "services": [
    { "service": "6a713c86f480932c18771a02", "quantity": 2, "_id": "6a73aed4f68224c2e7f7f883" }
  ]
}
```

Cada entrada de `services` referencia un servicio mediante su `ObjectId`. Si un servicio ya está asociado a la reserva y se vuelve a agregar, se incrementa `quantity` en vez de crear una entrada duplicada. Esta regla se aplica en `bookings.service.js`, nunca en el DAO.

La persistencia de las reservas se realiza en la colección `bookings` de MongoDB.

### Sobre el recurso `messages`

El proyecto incluye el modelo y el DAO de `messages` (`message.model.js`, `message.mongo.dao.js`), preparados como base para mensajes o notificaciones. No se implementó como recurso completo (sin repository, service, controller ni rutas propias), ya que ningún módulo del programa del curso llegó a requerirlo como endpoint funcional.

## Endpoints de la API

Todas las respuestas siguen una estructura consistente:

```json
{ "status": "success", "payload": {} }
```

o, en caso de error:

```json
{ "status": "error", "message": "" }
```

### `GET /api/services` — filtros, paginación y ordenamiento

| Query param | Ejemplo | Descripción |
|---|---|---|
| `category` | `?category=Mantenimiento` | Filtra por categoría exacta |
| `available` | `?available=true` | Filtra por disponibilidad |
| `page` | `?page=2` | Página solicitada (por defecto, `1`) |
| `limit` | `?limit=5` | Cantidad de resultados por página (por defecto, `10`) |
| `sortBy` | `?sortBy=price` | Campo por el que ordenar (por defecto, `price`) |
| `order` | `?order=desc` | `asc` o `desc` (por defecto, `asc`) |

Ejemplos:

```http
GET /api/services
GET /api/services?category=estetica&available=true
GET /api/services?page=1&limit=5
GET /api/services?sortBy=price&order=desc
GET /api/services?category=Neumáticos&sortBy=price&order=desc&page=1&limit=5
```

Respuesta:

```json
{
  "status": "success",
  "payload": [ /* array de servicios */ ],
  "totalPages": 2,
  "prevPage": null,
  "nextPage": 2,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevLink": null,
  "nextLink": "/api/services?page=2&limit=3"
}
```

### `GET /api/services/:sid`

- **200** si existe: `{ "status": "success", "payload": { ... } }`
- **404** si no existe: `{ "status": "error", "message": "Servicio no encontrado" }`
- **400** si `:sid` no tiene formato de ObjectId válido

### `POST /api/services`

Valida el body contra `createServiceSchema` (Zod) antes de llegar al controller.

- **201** si se crea correctamente
- **400** si faltan campos, el tipo de dato es incorrecto, o falta algún campo obligatorio (`name`, `description`, `duration`, `price`, `category`, `available`)

### `PUT /api/services/:sid`

Valida el body contra `updateServiceSchema` (todos los campos opcionales, mismos tipos que al crear).

- **200** si existe
- **400** si algún campo enviado no cumple el tipo esperado
- **404** si no existe

### `DELETE /api/services/:sid`

- **200** si se elimina
- **404** si no existe

### `POST /api/bookings`

Valida el body contra `createBookingSchema` (Zod), incluyendo formato de email.

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

- **201** si se crea correctamente
- **400** si faltan campos, el email no tiene formato válido, o algún tipo de dato es incorrecto

### `GET /api/bookings/:bid`

Devuelve la reserva con `services.service` poblado (`populate`), mostrando el detalle completo de cada servicio asociado junto con los datos de la reserva.

- **200** si existe
- **404** si no existe

### `POST /api/bookings/:bid/services/:sid`

Valida `req.params` (`bid` y `sid`) contra `bookingParamsSchema` (Zod), confirmando que ambos tengan formato de `ObjectId` antes de consultar la base de datos. No requiere body.

- **201** si se asocia correctamente (incrementa `quantity` si el servicio ya estaba asociado)
- **400** si `bid` o `sid` no tienen formato de ObjectId válido
- **404** si la reserva o el servicio no existen

## Validación de datos

Se utiliza [Zod](https://zod.dev/) para validar la forma de los datos de entrada antes de que lleguen a la capa de negocio. Los schemas están en `src/validations/`, separados de rutas y modelos, y se aplican mediante los middlewares `validateBody` / `validateParams` (`src/middlewares/validationSchema.js`).

| Endpoint | Valida | Schema |
|---|---|---|
| `POST /api/services` | `req.body` | `createServiceSchema` |
| `PUT /api/services/:sid` | `req.body` | `updateServiceSchema` (parcial) |
| `POST /api/bookings` | `req.body` | `createBookingSchema` |
| `POST /api/bookings/:bid/services/:sid` | `req.params` | `bookingParamsSchema` |

`GET /api/services/:sid` y `GET /api/bookings/:bid` no aplican Zod sobre sus params: el `CastError` de Mongoose ante un id mal formado ya es traducido a `400` por `errorHandler.js`, y agregar Zod ahí duplicaría esa protección sin aportar nada nuevo.

Ejemplo de rechazo por tipo incorrecto:

```http
POST /api/services
Content-Type: application/json

{ "name": "Test", "description": "Test", "duration": "1 hora", "price": "cien", "category": "Test", "available": true }
```

```json
{ "status": "error", "message": "Invalid input: expected number, received string" }
```

## Manejo de errores

El middleware `src/middlewares/errorHandler.js` distingue el tipo de error antes de responder:

- **`CastError`** (Mongoose): el `id` recibido no tiene formato de `ObjectId` válido → `400`.
- **`ValidationError`** (Mongoose): los datos no cumplen el schema del modelo → `400`.
- **Cualquier otro error**: se registra en consola y se responde `500` sin exponer detalles internos.

Los errores de validación de Zod se resuelven antes, en el middleware `validateBody`/`validateParams`, y nunca llegan a `errorHandler.js`.

## Cómo probar el proyecto

**API REST**: cualquier cliente HTTP ([Postman](https://www.postman.com/), [Thunder Client](https://www.thunderclient.com/), [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)). Los archivos de prueba usados se encuentran en `src/test/`.

**Vistas**: abrir `http://localhost:8081/views/services` y `http://localhost:8081/views/availability` en el navegador.

**Tiempo real**: con `/views/availability` abierta, enviar un `PUT /api/services/:sid` cambiando `available` desde un cliente HTTP. La vista debe reflejar el cambio sin recargar.

## Tecnologías utilizadas

- Node.js (ESM, v20+)
- Express
- MongoDB Atlas
- Mongoose
- express-handlebars
- Socket.io
- Zod
- dotenv

## Autor

Meier Leandro Agustín - Analista de Sistemas
