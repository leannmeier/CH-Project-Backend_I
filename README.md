# Backend Turnos y Reservas

Sistema backend para la gestión de servicios, turnos y reservas, desarrollado con Node.js utilizando módulos ESM (ECMAScript Modules). Este proyecto se construye de forma incremental a lo largo del curso de Desarrollo Backend, comenzando con un administrador de servicios persistido en archivos JSON.

## Estado del proyecto

- [x] Módulo 1: Configuración base, ESM, dotenv, ServiceManager (JSON)
- [x] Módulo 2: Servidor con Express y API REST
- [ ] Módulo 3: Persistencia con FileSystem
- [ ] Módulo 4: Routers y Controllers
- [ ] Módulo 5: Arquitectura en Capas: DAO y Repository
- [ ] Módulo 6: MongoDB Atlas y Mongoose
- [ ] Módulo 7: Vistas con Handlebars y WebSockets
- [ ] Módulo 8: Consultas Avanzadas, Validación y Populate
- [ ] Módulo 9: Proyecto Final integrador

## Funcionalidades implementadas:

- Configuración base del proyecto con Node.js y ESM
- Gestión segura de variables de entorno con `dotenv` y validación fail-fast
- Administrador de servicios (`ServiceManager`) con persistencia en JSON
- Servidor Express con API REST para el recurso `services`
- Router propio (`services.router.js`) con `express.Router()`, separado de `app.js`
- 5 endpoints REST conectados a `ServiceManager`, con filtros por query params y validación de datos

En próximos módulos se incorporarán arquitectura en capas, MongoDB con Mongoose, vistas con Handlebars, WebSockets y validaciones avanzadas.

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

## Estructura del proyecto

```
backend-turnos-reservas/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── env.config.js
│   ├── data/
│   │   └── services.json
│   ├── managers/
│   │   └── ServiceManager.js
│   ├── routes/
|   |   └── services.router.js
│   ├── test/
|   |   └── 01-test-services-manager.js
|   |   └── 02-api.http
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

## Endpoints de la API

Todas las respuestas siguen una estructura consistente:

```json
{ "status": "success", "payload": {} }
```

o, en caso de error:

```json
{ "status": "error", "message": "" }
```

### `GET /api/services`

Devuelve todos los servicios. Acepta filtros opcionales por query params.

| Query param | Ejemplo | Descripción |
|---|---|---|
| `category` | `?category=Mantenimiento` | Filtra por categoría exacta |
| `available` | `?available=true` | Filtra por disponibilidad |


```http
GET /api/services
GET /api/services?category=Mantenimiento
GET /api/services?available=true
```

**Respuesta 200:**
```json
{ "status": "success", "payload": [ /* array de servicios */ ] }
```

### `GET /api/services/:sid`

Devuelve un servicio según su `id`.

```http
GET /api/services/1
```

- **200** si el servicio existe: `{ "status": "success", "payload": { ... } }`
- **404** si no existe: `{ "status": "error", "message": "Servicio no encontrado" }`

### `POST /api/services`

Crea un nuevo servicio. El `id` se genera automáticamente y **no debe incluirse** en el body.

```http
POST /api/services
Content-Type: application/json

{
  "name": "Tapicero",
  "description": "Rejuvenecimiento de asientos de cuero",
  "duration": "3 horas",
  "price": 40,
  "category": "Tapicería",
  "available": true
}
```

- **201** si se crea correctamente: `{ "status": "success", "payload": { ... } }`
- **400** si faltan campos obligatorios (`name`, `description`, `duration`, `price`, `category`, `available`): `{ "status": "error", "message": "Faltan campos obligatorios: ..." }`

### `PUT /api/services/:sid`

Actualiza un servicio existente. El `id` original no puede modificarse aunque se incluya en el body.

```http
PUT /api/services/1
Content-Type: application/json

{
  "price": 999,
  "available": false
}
```

- **200** si el servicio existe: `{ "status": "success", "payload": { ... } }`
- **404** si no existe: `{ "status": "error", "message": "Servicio no encontrado" }`

### `DELETE /api/services/:sid`

Elimina un servicio según su `id`.

```http
DELETE /api/services/1
```

- **200** si se elimina correctamente: `{ "status": "success", "payload": { ... } }`
- **404** si no existe: `{ "status": "error", "message": "Servicio no encontrado" }`

## Cómo probar la API

Se puede probar con cualquier cliente HTTP: [Postman](https://www.postman.com/), [Thunder Client](https://www.thunderclient.com/) (extensión de VS Code) o la extensión [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client), usada durante el desarrollo de este proyecto.

Ejemplo de archivo `.http` para REST Client:
```http
### Para mostrar todos los servicios
GET http://localhost:8081/api/services

### Para mostrar un servicio por su id
GET http://localhost:8081/api/services/5

### Para crear un nuevo servicio
POST http://localhost:8081/api/services
Content-Type: application/json

{
    "name": "Programador JR",
    "description" : "Realiza pequeñas correcciones y debuguea" ,
    "duration" : "4 horas" ,
    "price" : 100,
    "category" : "IT",
    "available" :  true
}
### Para crear un nuevo servicio con campos faltantes
POST http://localhost:8081/api/services
Content-Type: application/json

{
    "name": "Programador SSR",
    "duration" : "8 horas" ,
    "price" : 200,
    "category" : "IT",
    "available" :  true
}

### Actualizar un servicio
PUT http://localhost:8081/api/services/7
Content-Type: application/json

{
  "price": 999
}

### Actualizar un servicio con id inexistente
PUT http://localhost:8081/api/services/8345
Content-Type: "application/json"

{
    "price" : 150
}

### Eliminar un servicio
DELETE http://localhost:8081/api/services/1

### Eliminar un servicio con id inexistente
DELETE http://localhost:8081/api/services/13434
```

## Tecnologías utilizadas

- Node.js (ESM)
- Express
- dotenv

## Autor

Meier Leandro Agustín - Analista de Sistemas
