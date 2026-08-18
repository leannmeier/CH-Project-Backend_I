# Backend Turnos y Reservas

## Descripción

Sistema backend para la gestión de servicios y reservas de turnos, desarrollado como proyecto integrador del curso de Desarrollo Backend. Permite administrar un catálogo de servicios, crear reservas asociadas a uno o más servicios existentes, y consultar la información relacionada entre ambas entidades.

La API está organizada en una arquitectura en capas (routes → controllers → services → repositories → DAO → models), con persistencia en MongoDB Atlas mediante Mongoose, validación de datos de entrada con Zod, vistas simples del lado del servidor con Handlebars, y una funcionalidad en tiempo real con Socket.io.

## Tecnologías utilizadas

- Node.js (ESM, v20+)
- Express
- MongoDB Atlas
- Mongoose
- Zod
- express-handlebars
- Socket.io
- dotenv

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
git clone https://github.com/leannmeier/CH-Project-Backend_I.git
cd "CH-Project-Backend_I"
npm install
```

Requiere Node.js v20 o superior.

## Variables de entorno

El proyecto requiere un archivo `.env` en la raíz. Se incluye `.env.example` como referencia, sin valores reales:

```
PORT=8081
NODE_ENV=development
MONGO_URI=tu_uri_de_mongodb
```

Copiar y completar antes de ejecutar el proyecto:

```bash
cp .env.example .env
```

`MONGO_URI` corresponde a un cluster de [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Es necesario habilitar el acceso a la IP correspondiente desde *Network Access* en el panel de Atlas.

La aplicación valida al iniciar que las variables críticas estén presentes y que la conexión a MongoDB sea exitosa antes de aceptar peticiones (patrón *fail-fast*). Si algo falla, el proceso se detiene con un mensaje de error descriptivo.

## Ejecución

```bash
npm start       # ejecuta el proyecto
npm run dev     # ejecuta el proyecto con reinicio automático ante cambios (node --watch)
```

El servidor queda disponible en `http://localhost:<PORT>` (por defecto, `http://localhost:8081`).

## Endpoints principales

Todas las respuestas siguen una estructura consistente:

```json
{ "status": "success", "payload": {} }
```

o, en caso de error:

```json
{ "status": "error", "message": "" }
```

### Services

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/services` | Lista servicios. Acepta `category`, `available`, `page`, `limit`, `sortBy`, `order` por query params, y devuelve metadata de paginación. |
| GET | `/api/services/:sid` | Obtiene un servicio por `_id`. |
| POST | `/api/services` | Crea un servicio. Valida el body con Zod. |
| PUT | `/api/services/:sid` | Actualiza un servicio. Valida el body con Zod. |
| DELETE | `/api/services/:sid` | Elimina un servicio. |

### Bookings

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/bookings` | Crea una reserva. `services` es opcional. Valida el body con Zod. |
| GET | `/api/bookings/:bid` | Obtiene una reserva, con cada servicio asociado poblado (`populate`). |
| POST | `/api/bookings/:bid/services/:sid` | Asocia un servicio existente a una reserva. Incrementa `quantity` si ya estaba asociado. |
| PUT | `/api/bookings/:bid/services/:sid` | Actualiza la cantidad (`quantity`) de un servicio ya asociado a la reserva. Body: `{ "quantity": number }`. |
| DELETE | `/api/bookings/:bid/services/:sid` | Elimina un servicio asociado de la reserva. |
| DELETE | `/api/bookings/:bid` | Elimina la reserva completa. |

Todos los endpoints de creación/actualización responden `400` ante campos faltantes, tipos de dato incorrectos o ids con formato inválido. Los que reciben un `:id` responden `404` cuando el recurso (o la asociación servicio-reserva) no existe.

### Vistas

| Ruta | Descripción |
|---|---|
| `GET /views/services` | Lista todos los servicios. |
| `GET /views/availability` | Lista los servicios con foco en su disponibilidad. Se actualiza en tiempo real (Socket.io) cuando cambia la disponibilidad de un servicio, sin recargar la página. |

## Funcionalidades

- **CRUD completo de servicios**, con validación de datos y persistencia en MongoDB.
- **Gestión completa de reservas**: creación, consulta, asociación de servicios existentes, actualización de la cantidad de un servicio dentro de una reserva, eliminación de un servicio de una reserva, y eliminación de la reserva completa.
- **Relaciones entre colecciones**: las reservas guardan referencias a servicios mediante `ObjectId` y `quantity`, nunca el objeto completo. `GET /api/bookings/:bid` usa `populate` para devolver el detalle completo de cada servicio asociado.
- **Consultas avanzadas** en `GET /api/services`: filtros por categoría y disponibilidad, paginación y ordenamiento configurable por query params.
- **Validación de datos de entrada con Zod**, aplicada como middleware antes de que la petición llegue a la lógica de negocio, en la creación/actualización de servicios, la creación de reservas, la asociación de un servicio a una reserva y la actualización de cantidades.
- **Arquitectura en capas**: routes, controllers, services, repositories, DAO, models, config, validations y views, cada una con una única responsabilidad. La lógica de negocio (validaciones, reglas como la cantidad incremental, emisión de eventos) está separada del acceso a datos (DAO), que es la única capa que conoce Mongoose.
- **Vistas simples con Handlebars**, alimentadas por la misma arquitectura en capas que la API REST (no constituyen un camino de datos paralelo).
- **Comunicación en tiempo real con Socket.io**: al actualizar la disponibilidad de un servicio, la vista `/views/availability` refleja el cambio sin recargar la página. La instancia de `io` se centraliza en `src/config/socket.config.js`, para que cualquier capa pueda emitir eventos sin depender directamente de `server.js`.
- **Manejo de errores en dos niveles**: Zod corta el flujo ante datos con formato inválido antes de llegar a la base de datos; un middleware de errores centralizado (`errorHandler.js`) distingue errores de Mongoose (`CastError`, `ValidationError`) de errores internos, sin exponer detalles del servidor al cliente.

## Arquitectura del proyecto

```
Cliente → Router → [Middleware de validación] → Controller → Service → Repository → DAO → MongoDB (Mongoose)
```

| Capa | Responsabilidad |
|---|---|
| **routes/** | Define los endpoints (API y vistas) y aplica los middlewares de validación correspondientes. |
| **middlewares/validationSchema.js** | `validateBody` / `validateParams`: validan `req.body` o `req.params` contra un schema de Zod, respondiendo `400` antes de llegar al controller si no cumplen. |
| **validations/** | Schemas de Zod por recurso, separados de rutas y modelos. |
| **controllers/** | Recibe la petición ya validada, llama al service y responde al cliente. |
| **services/** | Lógica de negocio: validaciones adicionales, construcción de filtros/paginación, la regla de `quantity` incremental, las validaciones de existencia (reserva, servicio, asociación entre ambos), y la emisión de eventos de Socket.io. |
| **repositories/** | Métodos de acceso a datos, independientes de Mongoose. |
| **dao/mongo/** | Única capa que conoce Mongoose. Ejecuta las operaciones sobre los modelos (`.find()`, `.skip()`, `.limit()`, `.sort()`, `.countDocuments()`, `.populate()`, `$pull`, actualización posicional `$`, etc.). |
| **dao/models/** | Schemas y Models de Mongoose. |

### Estructura de carpetas

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

## Recurso: Bookings

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

Cada entrada de `services` referencia un servicio mediante su `ObjectId`. Si un servicio ya está asociado y se vuelve a agregar, se incrementa `quantity` en vez de duplicar la entrada.

## Notas adicionales

- **Sobre el recurso `messages`**: el proyecto incluye el modelo y el DAO (`message.model.js`, `message.mongo.dao.js`) preparados como base para mensajes o notificaciones. No se implementó como recurso completo (sin repository, service, controller ni rutas), ya que ningún módulo del curso llegó a requerirlo como endpoint funcional.
- **Concurrencia**: la actualización de `quantity` y la eliminación de servicios de una reserva se resuelven con operadores atómicos de MongoDB (`$set` con el operador posicional `$`, `$pull`), evitando condiciones de carrera del tipo *lost update* al modificar el array `services` de una reserva.
- **Pruebas**: la API se probó con [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) (archivos `.http` en `src/test/`), cubriendo tanto los casos exitosos como los de error (recurso inexistente, datos incompletos, ids con formato inválido, servicio no asociado a una reserva).

## Autor

Meier Leandro Agustín - Analista de Sistemas
