# Backend Turnos y Reservas

Sistema backend para la gestión de servicios, turnos y reservas, desarrollado con Node.js utilizando módulos ESM (ECMAScript Modules). Este proyecto se construye de forma incremental a lo largo del curso de Desarrollo Backend, comenzando con un administrador de servicios persistido en archivos JSON.

## Estado del proyecto

- [x] Módulo 1: Configuración base, ESM, dotenv, ServiceManager (JSON)
- [ ] Módulo 2: Servidor con Express y API REST
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

En próximos módulos se incorporarán Express, arquitectura en capas, MongoDB con Mongoose, vistas con Handlebars, WebSockets y validaciones avanzadas.

## Instalación

Clonar el repositorio e instalar las dependencias:

git clone https://github.com/leannmeier/CH-Project-Backend_I.git
cd "CH-Project-Backend_I"
npm install

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
│   ├── managers/
│   │   └── ServiceManager.js
│   ├── utils/
│   │   ├── findById.js
│   │   └── newId.js
│   ├── data/
│   │   └── services.json
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── dao/
│   ├── models/
│   └── middlewares/
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

## ServiceManager

Clase encargada de administrar los servicios del sistema. Todos sus métodos leen y escriben directamente sobre `services.json`.

### `getServices()`

Devuelve un array con todos los servicios existentes.

```javascript
const servicios = manager.getServices();
console.log(servicios);
```

### `getServiceById(id)`

Devuelve el servicio correspondiente al `id` recibido, o `null` si no existe.

```javascript
const servicio = manager.getServiceById(2);
console.log(servicio); // { id: 2, name: 'Alineación y balanceo', ... }

const inexistente = manager.getServiceById(999);
console.log(inexistente); // null
```

### `addService(serviceData)`

Agrega un nuevo servicio. El `id` se genera automáticamente y no debe incluirse en `serviceData`. Valida que estén presentes los campos obligatorios (`name`, `description`, `duration`, `price`, `category`, `available`); si falta alguno, rechaza la creación y devuelve `null`.

```javascript
const nuevoServicio = manager.addService({
  name: "Tapicero",
  description: "Rejuvenecimiento de asientos de cuero",
  duration: "3 horas",
  price: 40,
  category: "Tapicería",
  available: true
});
console.log(nuevoServicio); // { id: 7, name: 'Tapicero', ... }

const incompleto = manager.addService({ name: "Servicio sin datos" });
console.log(incompleto); // null (campos obligatorios faltantes)
```

### `updateService(id, updatedData)`

Actualiza un servicio existente combinando los datos actuales con los nuevos. El `id` original nunca puede modificarse, aunque se incluya en `updatedData`. Devuelve `null` si el servicio no existe.

```javascript
const actualizado = manager.updateService(2, {
  price: 90,
  available: false
});
console.log(actualizado); // servicio con id 2, precio y disponibilidad actualizados
```

### `deleteService(id)`

Elimina el servicio correspondiente al `id` recibido. Devuelve el servicio eliminado, o `null` si no existía.

```javascript
const eliminado = manager.deleteService(3);
console.log(eliminado); // servicio eliminado, o null si no existía
```

## Tecnologías utilizadas

- Node.js (ESM)
- dotenv

## Autor

Meier Leandro Agustín - Analista de Sistemas
