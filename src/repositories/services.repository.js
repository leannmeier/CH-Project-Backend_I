import * as servicesDao from '../dao/fileSystem/services.fs.dao.js';
import { newId } from '../utils/newId.js';

export async function getAll(){
    return await servicesDao.getAll();
}

export async function getById(id){
    return await servicesDao.getById(id);
}

export async function create(serviceData){
    const data = await getAll();
    let nuevoService = {
        ...serviceData,
        id: newId(data)
    }
    return servicesDao.create(nuevoService);
}

export async function update(id, updateData){
    const services = await getAll()
    const servicioExistente = await getById(id);
    if(!servicioExistente){  
        return null
    }
    const actualizarServicio = { ...servicioExistente, ...updateData, id: servicioExistente.id}
    return await servicesDao.update(id, actualizarServicio);
}

export async function _delete(id){
    return await servicesDao._delete(id);
}   


