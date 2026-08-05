# Backend Turnos y Reservas

Sistema backend para la gestión de servicios, turnos y reservas, desarrollado con Node.js utilizando módulos ESM (ECMAScript Modules) y persistencia en MongoDB Atlas mediante Mongoose. Este proyecto se construye de forma incremental a lo largo del curso de Desarrollo Backend.

## Estado del proyecto

- [x] Módulo 1: Configuración base, ESM, dotenv, ServiceManager (JSON)
- [x] Módulo 2: Servidor con Express y API REST
- [x] Módulo 3: Persistencia asíncrona con FileSystem, recurso Bookings
- [x] Módulo 4: Organización en routes, controllers y managers
- [x] Módulo 5: Arquitectura en capas (services, repositories, DAO)
- [x] Módulo 6: Migración a MongoDB Atlas con Mongoose
- [ ] Módulo 7: Vistas con Handlebars y WebSockets
- [ ] Módulo 8: Consultas Avanzadas, Validación y Populate
- [ ] Módulo 9: Proyecto Final integrador

## Funcionalidades implementadas

- Configuración base del proyecto con Node.js (v20+) y ESM
- Gestión segura de variables de entorno con `dotenv` y validación fail-fast
- Servidor Express con API REST para los recursos `services` y `bookings`
- Arquitectura en capas: routes → controllers → services → repositories → DAO, con responsabilidades separadas
- Lógica de negocio (validaciones, regla de `quantity` incremental) desacoplada por completo del acceso a datos
- Persistencia en MongoDB Atlas mediante Mongoose, con conexión validada bajo el patrón fail-fast (la app no arranca si `MONGO_URI` falta o la conexión falla)
- Referencia entre `bookings` y `services` mediante `ObjectId`, evitando duplicar información entre colecciones. La reserva expone el servicio completo mediante `populate` solo en las consultas de lectura pensadas para mostrarse al cliente
- Modelo base para el recurso `messages`, preparado para su uso en el Módulo 7
- Manejo de errores en dos niveles: middleware de errores centralizado que distingue errores de datos inválidos (ids mal formados, validaciones de schema) de errores internos, evitando exponer detalles del servidor al cliente

En próximos módulos se incorporarán vistas con Handlebars, WebSockets (usando el recurso `messages`) y consultas avanzadas con validación y `populate`.

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

La aplicación valida al iniciar que las variables críticas estén presentes, y valida la conexión real a la base de datos antes de levantar el servidor. Si algo falla, el proceso se detiene con un mensaje de error descriptivo (patrón *fail-fast*), evitando que la app arranque en un estado inconsistente.

## Ejecución

```bash
npm start       # ejecuta el proyecto
npm run dev     # ejecuta el proyecto con reinicio automático ante cambios (node --watch)
```
El servidor queda disponible en `http://localhost:<PORT>` (por defecto, `http://localhost:8081`). Al iniciar, valida la conexión a MongoDB antes de aceptar peticiones.

## Arquitectura del proyecto

La API está organizada en capas, cada una con una única responsabilidad:

```
Cliente → Router → Controller → Service → Repository → DAO → MongoDB (Mongoose)
```

| Capa | Responsabilidad |
|---|---|
| **routes/** | Define los endpoints disponibles y los conecta con su controller. No contiene lógica propia. |
| **controllers/** | Recibe la petición (`req.params`, `req.query`, `req.body`), llama al service correspondiente y responde al cliente (`res.status().json()`). No accede a la persistencia ni conoce reglas de negocio. |
| **services/** | Contiene la lógica de negocio: validación de campos obligatorios y la regla de incrementar `quantity` cuando un servicio ya está asociado a una reserva. No conoce `req`/`res`, ni sabe si los datos vienen de MongoDB o de otro origen. |
| **repositories/** | Ofrece métodos genéricos de acceso a datos (`getAll`, `getById`, `create`, `update`, `delete`) para que la capa service no necesite conocer los detalles de Mongoose. |
| **dao/mongo/** | Interactúa directamente con MongoDB a través de los modelos de Mongoose (`dao/models/`). Es la única capa que conoce la existencia de Mongoose y de la base de datos. |
| **dao/models/** | Define los Schemas y Models de Mongoose (`service.model.js`, `booking.model.js`, `message.model.js`), incluyendo tipos, validaciones y referencias entre colecciones. |

Cada recurso tiene su propio conjunto de archivos por capa, siguiendo la convención `<recurso>.<capa>.js` (por ejemplo, `services.service.js`, `services.mongo.dao.js`).

### Ejemplo de flujo: crear un servicio

```
POST /api/services
  → services.router.js
  → addService (controller)
  → services.service.js → createService()   (valida campos obligatorios)
  → services.repository.js → create()
  → services.mongo.dao.js → create()         (ServiceModel.create(), Mongo genera el _id)
```

### Ejemplo de flujo con dependencia entre recursos: agregar un servicio a una reserva

```
POST /api/bookings/:bid/services/:sid
  → bookings.router.js
  → addServiceToBooking (controller)
  → bookings.service.js → addServiceToBooking()
      (obtiene la reserva SIN poblar, valida que el servicio exista
       consultando services.service.js, aplica la regla de quantity
       incremental sobre los ObjectId crudos)
  → bookings.repository.js → update()
  → bookings.mongo.dao.js → update()         (findByIdAndUpdate, devuelve el documento actualizado)
```

La comunicación entre los recursos `bookings` y `services` ocurre siempre a nivel de la capa service (`bookings.service.js` llama a `services.service.js`), nunca saltando directamente a un repository o DAO de otro recurso.

### `populate`: lectura para mostrar vs. lectura para modificar

`bookings.mongo.dao.js` expone dos formas de obtener una reserva por id:

- `getById`: devuelve el documento con los `ObjectId` de `services` sin resolver. Se usa cuando la reserva necesita ser modificada y comparada (por ejemplo, en `addServiceToBooking`), ya que operar sobre un documento poblado puede introducir inconsistencias al volver a guardarlo.
- `getByIdPopulated`: devuelve el documento con `services.service` resuelto mediante `populate`, trayendo el detalle completo de cada servicio asociado. Se usa exclusivamente para las consultas de lectura expuestas al cliente (`GET /api/bookings/:bid`).

## Estructura del proyecto

```
backend-turnos-reservas/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── env.config.js
│   │   └── database.config.js
│   ├── controllers/
│   │   ├── services.controller.js
│   │   └── bookings.controller.js
│   ├── dao/
│   │   ├── models/
│   │   │   ├── service.model.js
│   │   │   ├── booking.model.js
│   │   │   └── message.model.js
│   │   └── mongo/
│   │       ├── services.mongo.dao.js
│   │       ├── bookings.mongo.dao.js
│   │       └── messages.mongo.dao.js
│   ├── middlewares/
│   │   └── errorHandler.js
│   ├── repositories/
│   │   ├── services.repository.js
│   │   └── bookings.repository.js
│   ├── routes/
│   │   ├── services.router.js
│   │   └── bookings.router.js
│   ├── services/
│   │   ├── services.service.js
│   │   └── bookings.service.js
│   ├── test/
│   │   └── 06-api-mongo.http
│   └── utils/
│       └── asyncHandler.js
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

| Campo | Tipo | Descripción |
|---|---|---|
| `_id` | ObjectId | Identificador único, generado automáticamente por MongoDB. No se recibe como parámetro ni puede modificarse. |
| `name` | string | Nombre del servicio. |
| `description` | string | Descripción detallada del servicio. |
| `duration` | string | Duración estimada del servicio. |
| `price` | number | Precio del servicio. |
| `category` | string | Categoría a la que pertenece el servicio. |
| `available` | boolean | Indica si el servicio está disponible para reservar. |
| `createdAt` / `updatedAt` | date | Generados automáticamente por Mongoose (`timestamps`). |

La persistencia de los servicios se realiza en la colección `services` de MongoDB.

## Recurso: Bookings

Una reserva representa un turno solicitado por un cliente, con uno o más servicios asociados.

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

| Campo | Tipo | Descripción |
|---|---|---|
| `_id` | ObjectId | Identificador único, generado automáticamente por MongoDB. |
| `clientName` | string | Nombre del cliente que realiza la reserva. |
| `clientEmail` | string | Email de contacto del cliente. |
| `date` | string | Fecha del turno. |
| `time` | string | Horario del turno. |
| `status` | boolean | Estado de la reserva. |
| `services` | array | Servicios asociados a la reserva. Puede iniciarse vacío. |

Cada entrada de `services` referencia un servicio mediante su `ObjectId` (campo `service`, con `ref` a la colección `services`), y tiene su propio `_id` de subdocumento asignado por Mongoose. Si un servicio ya está asociado a la reserva y se vuelve a agregar, se incrementa `quantity` en vez de crear una entrada duplicada. Esta regla se aplica en `bookings.service.js`, nunca en el DAO.

Al consultar una reserva mediante `GET /api/bookings/:bid`, el campo `service` de cada entrada se devuelve poblado con el documento completo del servicio (ver sección de `populate` en Arquitectura del proyecto).

La persistencia de las reservas se realiza en la colección `bookings` de MongoDB.

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

#### `GET /api/services`

Devuelve todos los servicios. Acepta filtros opcionales por query params.

| Query param | Ejemplo | Descripción |
|---|---|---|
| `category` | `?category=Mantenimiento` | Filtra por categoría exacta |
| `available` | `?available=true` | Filtra por disponibilidad |

- **200**: `{ "status": "success", "payload": [ /* array de servicios */ ] }`

#### `GET /api/services/:sid`

Devuelve un servicio según su `_id`.

- **200** si existe: `{ "status": "success", "payload": { ... } }`
- **400** si `:sid` no tiene el formato de un ObjectId válido: `{ "status": "error", "message": "El id proporcionado no es válido" }`
- **404** si no existe: `{ "status": "error", "message": "Servicio no encontrado" }`

#### `POST /api/services`

Crea un nuevo servicio. El `_id` lo genera MongoDB automáticamente.

- **201** si se crea correctamente: `{ "status": "success", "payload": { ... } }`
- **400** si faltan campos obligatorios (`name`, `description`, `duration`, `price`, `category`, `available`): `{ "status": "error", "message": "Faltan campos obligatorios: ..." }`

#### `PUT /api/services/:sid`

Actualiza un servicio existente. Devuelve el documento ya actualizado.

- **200** si existe: `{ "status": "success", "payload": { ... } }`
- **400** si algún campo enviado no cumple el schema (tipo incorrecto): `{ "status": "error", "message": "..." }`
- **404** si no existe: `{ "status": "error", "message": "Servicio no encontrado" }`

#### `DELETE /api/services/:sid`

Elimina un servicio según su `_id`.

- **200** si se elimina correctamente: `{ "status": "success", "payload": { ... } }`
- **404** si no existe: `{ "status": "error", "message": "Servicio no encontrado" }`

### Bookings

#### `POST /api/bookings`

Crea una nueva reserva. El `_id` lo genera MongoDB automáticamente. El campo `services` es opcional; si no se envía, la reserva se crea con `services: []`.

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

Devuelve una reserva según su `_id`, con cada servicio asociado poblado (`populate`).

- **200** si existe: `{ "status": "success", "payload": { ... } }`
- **404** si no existe: `{ "status": "error", "message": "Reserva no encontrada" }`

#### `POST /api/bookings/:bid/services/:sid`

Agrega un servicio existente a una reserva existente. No requiere body: el servicio a agregar se identifica exclusivamente por el parámetro `:sid` de la URL. Valida que tanto la reserva como el servicio existan. Si el servicio ya estaba asociado a la reserva, incrementa su `quantity` en vez de duplicar la entrada.

```http
POST /api/bookings/6a7359b65c8734f64ff4d6d7/services/6a713c86f480932c18771a02
```

- **201** si se asocia correctamente: `{ "status": "success", "payload": { ... /* reserva actualizada */ } }`
- **404** si la reserva o el servicio no existen: `{ "status": "error", "message": "Reserva no encontrada" }` o `{ "status": "error", "message": "Servicio no encontrado" }`

## Manejo de errores

Las rutas están envueltas con un wrapper (`src/utils/asyncHandler.js`) que captura cualquier error no controlado dentro de un handler asíncrono y lo redirige al middleware de errores de Express, sin necesidad de repetir `try/catch` en cada controller.

El middleware `src/middlewares/errorHandler.js` distingue el tipo de error antes de responder:

- **`CastError`** (Mongoose): el `id` recibido no tiene el formato de un `ObjectId` válido → responde `400` con un mensaje claro.
- **`ValidationError`** (Mongoose): los datos enviados no cumplen el schema (tipo incorrecto, campo requerido faltante) → responde `400` con el detalle de la validación.
- **Cualquier otro error**: se registra en consola para depuración y se responde `500` con un mensaje genérico, sin exponer detalles internos del servidor (como stack traces).

```json
{ "status": "error", "message": "Error interno del servidor" }
```

Este mecanismo es independiente de los errores de validación de negocio (por ejemplo, campos faltantes o recurso no encontrado), que se manejan explícitamente en la capa de servicios y se comunican con los códigos de estado correspondientes (400, 404).

## Cómo probar la API

Se puede probar con cualquier cliente HTTP: [Postman](https://www.postman.com/), [Thunder Client](https://www.thunderclient.com/) (extensión de VS Code) o la extensión [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client), usada durante el desarrollo de este proyecto. Los archivos de prueba usados se encuentran en `src/test/`.

Los datos de prueba se cargan mediante los endpoints `POST` de la propia API (no existe un script de migración/seed automático), reutilizando la misma vía que usaría cualquier cliente real.

Se puede inspeccionar visualmente el contenido de la base de datos desde el panel de MongoDB Atlas (*Browse Collections*) o con [MongoDB Compass](https://www.mongodb.com/products/compass).

## Tecnologías utilizadas

- Node.js (ESM, v20+)
- Express
- MongoDB Atlas
- Mongoose
- dotenv

## Autor

Meier Leandro Agustín - Analista de Sistemas
