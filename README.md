# Backend Turnos y Reservas

Sistema backend para la gestión de servicios, turnos y reservas, desarrollado con Node.js utilizando módulos ESM (ECMAScript Modules). Este proyecto se construye de forma incremental a lo largo del curso de Desarrollo Backend, comenzando con una persistencia basada en archivos JSON.

## Estado del proyecto

- [x] Módulo 1: Configuración base, ESM, dotenv, ServiceManager (JSON)
- [x] Módulo 2: Servidor con Express y API REST
- [x] Módulo 3: Persistencia asíncrona con FileSystem, recurso Bookings
- [x] Módulo 4: Organización en routes, controllers y managers
- [x] Módulo 5: Arquitectura en capas (services, repositories, DAO)
- [ ] Módulo 6: MongoDB Atlas y Mongoose
- [ ] Módulo 7: Vistas con Handlebars y WebSockets
- [ ] Módulo 8: Consultas Avanzadas, Validación y Populate
- [ ] Módulo 9: Proyecto Final integrador

## Funcionalidades implementadas:

- Configuración base del proyecto con Node.js y ESM
- Gestión segura de variables de entorno con `dotenv` y validación fail-fast
- Servidor Express con API REST para los recursos `services` y `bookings`
- Arquitectura en capas: routes → controllers → services → repositories → DAO, con responsabilidades separadas
- Lógica de negocio (validaciones, generación de ids, regla de `quantity` incremental) desacoplada del acceso a datos
- Persistencia asíncrona en archivos JSON con `fs.promises` (`async`/`await`), encapsulada por completo en la capa DAO
- Manejo de errores en dos niveles: try/catch en el DAO, y middleware de manejo de errores centralizado en Express para las rutas, evitando exponer detalles internos al cliente

En próximos módulos se incorporará MongoDB con Mongoose (reemplazando la implementación de DAO basada en FileSystem), vistas con Handlebars, WebSockets y validaciones avanzadas.

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

## Arquitectura del proyecto

La API está organizada en capas, cada una con una única responsabilidad:

```
Cliente → Router → Controller → Service → Repository → DAO → Archivo JSON
```

| Capa | Responsabilidad |
|---|---|
| **routes/** | Define los endpoints disponibles y los conecta con su controller. No contiene lógica propia. |
| **controllers/** | Recibe la petición (`req.params`, `req.query`, `req.body`), llama al service correspondiente y responde al cliente (`res.status().json()`). No accede a la persistencia ni conoce reglas de negocio. |
| **services/** | Contiene la lógica de negocio: validación de campos obligatorios, protección del id autogenerado, y la regla de incrementar `quantity` cuando un servicio ya está asociado a una reserva. No conoce `req`/`res`, ni sabe cómo ni dónde se almacenan los datos. |
| **repositories/** | Ofrece métodos genéricos de acceso a datos (`getAll`, `getById`, `create`, `update`, `delete`) para que la capa service no necesite saber si los datos vienen de un archivo JSON o de una base de datos. |
| **dao/** | Lee y escribe directamente en los archivos JSON. Es la única capa que conoce la ruta de los archivos de datos. Sin lógica de negocio: solo validaciones técnicas necesarias para la operación (por ejemplo, confirmar que un registro existe antes de actualizarlo). |

Cada recurso (`services`, `bookings`) tiene su propio conjunto de archivos en cada capa, siguiendo la convención `<recurso>.<capa>.js` (por ejemplo, `services.service.js`, `services.repository.js`).

### Ejemplo de flujo: crear un servicio

```
POST /api/services
  → services.router.js
  → addService (controller)
  → services.service.js → createService()  (valida campos obligatorios)
  → services.repository.js → create()      (genera el id)
  → services.fs.dao.js → create()          (escribe en services.json)
```

### Ejemplo de flujo con dependencia entre recursos: agregar un servicio a una reserva

```
POST /api/bookings/:bid/services/:sid
  → bookings.router.js
  → addServiceToBooking (controller)
  → bookings.service.js → addServiceToBooking()
      (valida que la reserva exista, consulta services.service.js
       para validar que el servicio exista, aplica la regla de
       quantity incremental)
  → bookings.repository.js → update()
  → bookings.fs.dao.js → update()          (escribe en bookings.json)
```

La comunicación entre los recursos `bookings` y `services` ocurre siempre a nivel de la capa service (`bookings.service.js` llama a `services.service.js`), nunca saltando directamente a un repository o DAO de otro recurso.

## Estructura del proyecto

```
backend-turnos-reservas/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── env.config.js
│   ├── controllers/
│   │   ├── services.controller.js
│   │   └── bookings.controller.js
│   ├── dao/
│   │   └── fileSystem/
│   │       ├── services.fs.dao.js
│   │       └── bookings.fs.dao.js
│   ├── data/
│   │   ├── bookings.json
│   │   └── services.json
│   ├── middlewares/
│   │   └── errorHandler.js
│   ├── repositories/
│   │   ├── services.repository.js
│   │   └── bookings.repository.js
│   ├── routes/
│   │   ├── bookings.router.js
|   |   └── services.router.js
│   ├── services/
│   │   ├── services.service.js
│   │   └── bookings.service.js
│   ├── test/
│   │   ├── 02-api-services.http
│   │   ├── 03-api-bookings.http
│   └── utils/
│       ├── asyncHandler.js
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

La persistencia de las reservas se realiza en `src/data/bookings.json`. La validación de la existencia del servicio se realiza mediante la capa `services.service.js`, manteniendo la comunicación entre recursos a nivel de la capa service y evitando acceder directamente a la persistencia.


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

Agrega un servicio existente a una reserva existente. No requiere body: el servicio a agregar se identifica exclusivamente por el parámetro `:sid` de la URL. Valida que tanto la reserva como el servicio existan. Si el servicio ya estaba asociado a la reserva, incrementa su `quantity` en vez de duplicar la entrada.ada.

```http
POST /api/bookings/1/services/3
```

- **201** si se asocia correctamente: `{ "status": "success", "payload": { ... /* reserva actualizada */ } }`
- **404** si la reserva o el servicio no existen: `{ "status": "error", "message": "Reserva no encontrada" }` o `{ "status": "error", "message": "Servicio no encontrado" }`

## Manejo de errores

Las rutas están envueltas con un wrapper (`src/utils/asyncHandler.js`) que captura cualquier error no controlado dentro de un handler asíncrono y lo redirige al middleware de errores de Express, sin necesidad de repetir `try/catch` en cada controller.

El middleware `src/middlewares/errorHandler.js` intercepta esos errores, los registra en consola para depuración, y responde al cliente con un mensaje genérico, evitando exponer detalles internos del servidor (como stack traces):

```json
{ "status": "error", "message": "Error interno del servidor" }
```

Este mecanismo es independiente de los errores de validación de negocio (por ejemplo, campos faltantes o recurso no encontrado), que se manejan explícitamente en la capa de servicios y se comunican con los códigos de estado correspondientes (400, 404).

## Limitaciones conocidas

La persistencia actual con archivos JSON no garantiza atomicidad ante escrituras concurrentes: si varias peticiones modifican el mismo recurso de forma simultánea (por ejemplo, múltiples llamados a `POST /api/bookings/:bid/services/:sid` en paralelo), es posible que alguna actualización se pierda (*lost update*). Esta limitación es inherente a FileSystem como mecanismo de persistencia y se resolverá con la migración a MongoDB.

## Cómo probar la API

Se puede probar con cualquier cliente HTTP: [Postman](https://www.postman.com/), [Thunder Client](https://www.thunderclient.com/) (extensión de VS Code) o la extensión [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client), usada durante el desarrollo de este proyecto Los archivos de prueba usados se 
encuentran en `src/test/`.

## Tecnologías utilizadas

- Node.js (ESM)
- Express
- dotenv

## Autor

Meier Leandro Agustín - Analista de Sistemas
