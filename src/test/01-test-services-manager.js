import { ServiceManager } from "../managers/ServiceManager.js";

const manager = new ServiceManager;

// -----------------------------------------------------------------------------------------------------------------
// Muestra todos los servicios
console.log(manager.getServices()); 

// -----------------------------------------------------------------------------------------------------------------
// Agregamos un nuevo servicio
let nuevoServicio = {
        "name": "Tapicero",
        "description": "Rejuvenecimiento de asientos de cuero",
        "duration": "3 horas",
        "price": 40,
        "category": "Tapiceria",
        "available": true
    }
const servicioAgregado = manager.addService(nuevoServicio); //Si no se pudo agregar, devuelve null
console.log(servicioAgregado); // Verificamos su valor
// -----------------------------------------------------------------------------------------------------------------
// Agregamos un nuevo servicio (con campos faltantes)
let servicioFaltante = {
        "name": "Tapicero",
        "description": "Rejuvenecimiento de asientos de cuero",
        "price": 40,
        "category": "Tapiceria",
        "available": true
    }
const faltante = manager.addService(servicioFaltante); // deberia mostrar un mensaje en consola informando el/los campo/s faltante/s
console.log(faltante); // Verificamos su valor

// -----------------------------------------------------------------------------------------------------------------

// Obtenemos un servicio por medio de su id (Si no existe, devuelve null)
let servicioPorId = manager.getServiceById(2); // Este id actualmente existe
console.log(servicioPorId); // Muestra el servicio con ese id

servicioPorId = manager.getServiceById(3234342);
console.log(servicioPorId); // Muestra null

// -----------------------------------------------------------------------------------------------------------------
// Actualizamos un serivicio (elemento con el id = 2)
let actualizarServicio = {
        "name": "Alineación y balanceo",
        "description": "Ajuste de la alineación de las ruedas y balanceo para mejorar la estabilidad y prolongar la vida útil de los neumáticos.",
        "duration": "2 hora 30 minutos", // cambiamos la hora
        "price": 90, // El precio
        "category": "Neumáticos",
        "available": true
    }
let actualizado = manager.updateService(2,actualizarServicio); 
console.log(actualizado); //Deberiamos ver la diferencia en el elemento con el id = 2 

// -----------------------------------------------------------------------------------------------------------------
// Eliminamos un servicio por medio de su id (Si no existe, no elimina nada e imprime 'null')
const eliminado = manager.deleteService(3); 
console.log('Eliminado:\n',eliminado); 

console.log(manager.getServices()); // Verificamos que se haya eliminado
