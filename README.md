# Backend Turnos y Reservas

Sistema backend para la gestión de servicios, turnos y reservas, desarrollado con Node.js utilizando módulos ESM (ECMAScript Modules), persistencia en MongoDB Atlas mediante Mongoose, vistas del lado del servidor con Handlebars y comunicación en tiempo real con Socket.io. Este proyecto se construye de forma incremental a lo largo del curso de Desarrollo Backend.

## Estado del proyecto

- [x] Módulo 1: Configuración base, ESM, dotenv, ServiceManager (JSON)
- [x] Módulo 2: Servidor con Express y API REST
- [x] Módulo 3: Persistencia asíncrona con FileSystem, recurso Bookings
- [x] Módulo 4: Organización en routes, controllers y managers
- [x] Módulo 5: Arquitectura en capas (services, repositories, DAO)
- [x] Módulo 6: Migración a MongoDB Atlas con Mongoose
- [x] Módulo 7: Vistas con Handlebars y comunicación en tiempo real con Socket.io
- [ ] Módulo 8: Consultas Avanzadas, Validación y Populate
- [ ] Entrega FInal

## Funcionalidades implementadas

- Configuración base del proyecto con Node.js (v20+) y ESM
- Gestión segura de variables de entorno con `dotenv` y validación fail-fast
- Servidor Express con API REST para los recursos `services` y `bookings`
- Arquitectura en capas: routes → controllers → services → repositories → DAO, con responsabilidades separadas
- Persistencia en MongoDB Atlas mediante Mongoose, con conexión validada bajo el patrón fail-fast
- Referencia entre `bookings` y `services` mediante `ObjectId`, con `populate` para las consultas de lectura destinadas a mostrarse
- Vistas del lado del servidor con Handlebars (`/views/services`, `/views/availability`), alimentadas por la misma arquitectura en capas que la API REST
- Comunicación en tiempo real con Socket.io: al actualizar la disponibilidad de un servicio, la vista `/views/availability` se actualiza en el navegador sin recargar la página
- Manejo de errores en dos niveles: middleware de errores centralizado que distingue errores de datos inválidos (ids mal formados, validaciones de schema) de errores internos

En el próximo módulo se incorporarán consultas avanzadas, validaciones adicionales y un uso más profundo de `populate`.

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

La aplicación valida al iniciar que las variables críticas estén presentes, y valida la conexión real a la base de datos antes de levantar el servidor. Si algo falla, el proceso se detiene con un mensaje de error descriptivo (patrón *fail-fast*).

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
| **routes/** | Define los endpoints disponibles (tanto de API como de vistas) y los conecta con su controller. |
| **controllers/** | Recibe la petición, llama al service correspondiente y responde al cliente (JSON en la API, HTML renderizado en las vistas). No accede a la persistencia ni conoce reglas de negocio. |
| **services/** | Contiene la lógica de negocio: validaciones, la regla de `quantity` incremental, y la emisión de eventos de Socket.io tras una actualización relevante. No conoce `req`/`res`. |
| **repositories/** | Ofrece métodos genéricos de acceso a datos, independientes de Mongoose. |
| **dao/mongo/** | Interactúa directamente con MongoDB a través de los modelos de Mongoose. Es la única capa que conoce la existencia de Mongoose. |
| **dao/models/** | Define los Schemas y Models de Mongoose. |

### Vistas (Handlebars)

Las vistas no constituyen una arquitectura paralela: `views.router.js` conecta cada ruta con `views.controller.js`, y este llama a la misma capa `services/` que usan los controllers de la API REST. Ninguna vista contiene datos hardcodeados ni accede directamente a un repository o al DAO.

```
GET /views/services
  → views.router.js
  → renderServices (views.controller.js)
  → services.service.js → getServices()
  → res.render('services', { services })
```

Los documentos de Mongoose se convierten a objetos planos (`.toObject()`) en `views.controller.js` antes de pasarlos a Handlebars, ya que el motor de plantillas no puede acceder a las propiedades de una instancia de Mongoose directamente.

### Comunicación en tiempo real (Socket.io)

La instancia de Socket.io (`io`) se crea en `server.js`, junto con el servidor HTTP que envuelve a Express. Como `io` debe estar disponible desde capas que no conocen `server.js` (en este caso, `services.service.js`), se centraliza en `src/config/socket.config.js`, siguiendo el mismo criterio que `database.config.js`: una pieza de infraestructura compartida, no un recurso con operaciones CRUD propias, por lo que no se modeló como una capa adicional de service/repository/DAO.

```
server.js         → crea io, lo registra con setIO(io)
socket.config.js  → guarda y expone la instancia (setIO / getIO)
services.service.js → getIO().emit('availabilityUpdated', servicio) tras una actualización exitosa
public/js/socket.js → escucha 'availabilityUpdated' en el navegador y actualiza el DOM
```

Flujo completo, actualizar la disponibilidad de un servicio:

```
PUT /api/services/:sid
  → services.router.js → updateService (controller)
  → services.service.js → updateService()
      (actualiza en MongoDB vía repository/DAO, y si tuvo éxito,
       emite 'availabilityUpdated' con el documento actualizado)
  → cualquier navegador con /views/availability abierta recibe
    el evento y actualiza el estado del servicio sin recargar
```

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
│   │   └── 06-api-mongo.http (editado)
│   └── utils/
│       └── asyncHandler.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Vistas disponibles

### `GET /views/services`

Lista todos los servicios registrados, mostrando nombre, descripción, duración, precio, categoría y disponibilidad.

### `GET /views/availability`

Lista los servicios con foco en su estado de disponibilidad. Se actualiza en tiempo real: si la disponibilidad de un servicio cambia mediante `PUT /api/services/:sid`, todos los navegadores con esta vista abierta reflejan el cambio sin recargar la página.

## Recurso: Services

Un servicio representa una actividad que puede reservarse dentro del sistema de turnos.

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

Cada entrada de `services` referencia un servicio mediante su `ObjectId`. Si un servicio ya está asociado a la reserva y se vuelve a agregar, se incrementa `quantity` en vez de crear una entrada duplicada. Esta regla se aplica en `bookings.service.js`, nunca en el DAO.

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

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/services` | Lista todos los servicios. Filtros opcionales `?category=` y `?available=`. |
| GET | `/api/services/:sid` | Obtiene un servicio por `_id`. |
| POST | `/api/services` | Crea un servicio. |
| PUT | `/api/services/:sid` | Actualiza un servicio y emite `availabilityUpdated` por Socket.io. |
| DELETE | `/api/services/:sid` | Elimina un servicio. |

### Bookings

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/bookings` | Crea una reserva. `services` es opcional. |
| GET | `/api/bookings/:bid` | Obtiene una reserva por `_id`, con los servicios poblados. |
| POST | `/api/bookings/:bid/services/:sid` | Asocia un servicio existente a una reserva existente. Incrementa `quantity` si ya estaba asociado. |

Todos los endpoints de creación/actualización responden `400` ante campos faltantes o datos con formato inválido, y `404` cuando el recurso solicitado no existe.

## Manejo de errores

El middleware `src/middlewares/errorHandler.js` distingue el tipo de error antes de responder:

- **`CastError`** (Mongoose): el `id` recibido no tiene el formato de un `ObjectId` válido → `400`.
- **`ValidationError`** (Mongoose): los datos enviados no cumplen el schema → `400`.
- **Cualquier otro error**: se registra en consola y se responde `500` sin exponer detalles internos del servidor.

## Cómo probar el proyecto

**API REST**: cualquier cliente HTTP ([Postman](https://www.postman.com/), [Thunder Client](https://www.thunderclient.com/), [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)). Los archivos de prueba usados se encuentran en `src/test/`.

**Vistas**: abrir directamente `http://localhost:8081/views/services` y `http://localhost:8081/views/availability` en el navegador.

**Tiempo real**: con `http://localhost:8081/views/availability` abierta en el navegador, enviar un `PUT /api/services/:sid` cambiando el campo `available` desde un cliente HTTP. La vista debe reflejar el cambio sin recargar la página.

## Tecnologías utilizadas

- Node.js (ESM, v20+)
- Express
- MongoDB Atlas
- Mongoose
- express-handlebars
- Socket.io
- dotenv

## Autor

Meier Leandro Agustín - Analista de Sistemas
