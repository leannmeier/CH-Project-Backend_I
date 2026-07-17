import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findById } from '../utils/findById.js';
import { newId } from '../utils/newId.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RUTA_ARCHIVO = path.join(__dirname, '../data/services.json');

export class ServiceManager{
    #readServices(){
        const data = fs.readFileSync(RUTA_ARCHIVO, 'utf-8');
        return JSON.parse(data);
    }
    #saveServices(services){
        fs.writeFileSync(RUTA_ARCHIVO, JSON.stringify(services, null, 4),'utf-8');
    }
    getServices() {
        return this.#readServices();
    }
    getServiceById(id){
        const services = this.#readServices();
        return findById(id, services);
    }
    addService(serviceData){
        let nuevoServicio = null;
        const services = this.#readServices();

        const camposRequeridos = ['name', 'description', 'duration', 'price', 'category', 'available'];
        const faltantes = camposRequeridos.filter(campo => {
            const valor = serviceData[campo];
            return valor === undefined || valor === null || valor === '';
        });

        if (faltantes.length == 0){
            nuevoServicio = {id: newId(services), ...serviceData}
            services.push(nuevoServicio);
            this.#saveServices(services);
            console.log('Nuevo servicio agregado');
        }
        else{
            console.log(`Faltan campos obligatorios: ${faltantes.join(', ')}` );
        }
        return nuevoServicio;
    }
    updateService(id, updateData){
        const services = this.#readServices();
        let servicioExistente = findById(id, services);
        let servicioActualizado = null;
        let serviciosActualizados = null;
        if(servicioExistente){
            servicioActualizado = { ...servicioExistente, ...updateData, id: servicioExistente.id }
            serviciosActualizados = services.map(s => s.id === Number(id) ? servicioActualizado : s )
            this.#saveServices(serviciosActualizados);
        }
        return servicioActualizado;
    }
    deleteService(id){
        const services = this.#readServices();
        let eliminarServicio = findById(id, services) ;
        let serviciosActualizados = [];
        if(eliminarServicio){
            serviciosActualizados = services.filter(s => s.id !== Number(id))
            this.#saveServices(serviciosActualizados);
        }
        return eliminarServicio;
    }

}
