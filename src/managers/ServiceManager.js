import fs from 'node:fs/promises';
import path from 'node:path';

import { fileURLToPath } from 'node:url';

import { findById } from '../utils/findById.js';
import { newId } from '../utils/newId.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RUTA_SERVICIOS = path.join(__dirname, '../data/services.json');

export class ServiceManager{

    async #readServices(){
        try{
            const data = await fs.readFile(RUTA_SERVICIOS, 'utf-8');
            return JSON.parse(data);
        }
        catch(error){
            throw new Error(`No se pudo leer los servicios: ${error.message}`);
        }
    }

    async #saveServices(services){
        await fs.writeFile(RUTA_SERVICIOS, JSON.stringify(services,null,2), 'utf-8');
    }

    async getServices() {
        return await this.#readServices();
    }

    async getServiceById(id){
        const services = await this.#readServices();
        return findById(id, services);
    }

    async addService(serviceData){
        let nuevoServicio = null;
        const services = await this.#readServices();
        const camposRequeridos = ['name', 'description', 'duration', 'price', 'category', 'available'];
        
        const faltantes = camposRequeridos.filter(campo => {
            const valor = serviceData[campo];
            return valor === undefined || valor === null || valor === '';
        });
        if (faltantes.length == 0){
            const { id: _idIgnorado, ...datosLimpios } = serviceData;
            nuevoServicio = {
                ...serviceData,
                id: newId(services)
            }
            services.push(nuevoServicio);
            await this.#saveServices(services);
            console.log('Nuevo servicio agregado');
        }
        else{
            nuevoServicio = { error: `Faltan campos obligatorios: ${faltantes.join(', ')}` };
        }
        return nuevoServicio;
    }

    async updateService(id, updateData){
        const services = await this.#readServices();
        let servicioExistente = findById(id, services);
        let servicioActualizado = null;
        let serviciosActualizados = null;
        if(servicioExistente){
            servicioActualizado = { ...servicioExistente, ...updateData, id: servicioExistente.id }
            serviciosActualizados = services.map(s => s.id === Number(id) ? servicioActualizado : s )
            await this.#saveServices(serviciosActualizados);
            console.log('Servicio actualizado');
        }
        return servicioActualizado;
    }

    async deleteService(id){
        const services = await this.#readServices();
        let eliminarServicio = findById(id, services) ;
        let serviciosActualizados = [];
        if(eliminarServicio){
            serviciosActualizados = services.filter(s => s.id !== Number(id))
            await this.#saveServices(serviciosActualizados);
            console.log('Servicio eliminado');
        }
        return eliminarServicio;
    }

}
