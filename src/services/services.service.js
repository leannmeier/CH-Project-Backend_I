import * as servicesRepository from '../repositories/services.repository.js';
import { getIO } from '../config/socket.config.js';

const camposRequeridos = ['name', 'description', 'duration', 'price', 'category', 'available'];

export async function getServices(){
    return await servicesRepository.getAll();
}

export async function getServiceById(id){
    return await servicesRepository.getById(id);
}

export async function createService(serviceData){
    let service
    const faltantes = camposRequeridos.filter( c => {
        const valor = serviceData[c];
        return valor === undefined || valor === null || valor === '';
    })
    if(faltantes.length == 0){
       service = await servicesRepository.create(serviceData);
    }
    else{
        service = { error: `Faltan campos: ${faltantes.join(', ')}`};
    }
    return service;
}
export async function updateService(id, serviceData) {
    const updated = await servicesRepository.update(id, serviceData);
    if (updated) {
        getIO().emit('availabilityUpdated', updated.toObject ? updated.toObject() : updated);
    }
    return updated;
}

export async function deleteService(id){
    return await servicesRepository._delete(id);
}