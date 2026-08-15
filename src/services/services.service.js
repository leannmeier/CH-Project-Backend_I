import * as servicesRepository from '../repositories/services.repository.js';
import { getIO } from '../config/socket.config.js';

const camposRequeridos = ['name', 'description', 'duration', 'price', 'category', 'available'];

export async function getServices(query) {
    const { category, available, page = 1, limit = 10, sortBy = 'price', order = 'asc' } = query;

    const filter = {};
    if (category) filter.category = category;
    if (available) filter.available = available === 'true';

    const skip = (page - 1) * limit;

    const sortOption = {};
    if (order === 'asc') sortOption[sortBy] = 1;
    if (order === 'desc') sortOption[sortBy] = -1;

    const { services, total } = await servicesRepository.getAll({ filter, skip, limit: Number(limit), sort: sortOption });

    const totalPages = Math.ceil(total / limit);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? Number(page) - 1 : null;
    const nextPage = hasNextPage ? Number(page) + 1 : null;

    return {
        status: 'success',
        payload: services,
        totalPages,
        prevPage,
        nextPage,
        page: Number(page),
        hasPrevPage,
        hasNextPage,
        prevLink: hasPrevPage ? `/api/services?page=${prevPage}&limit=${limit}` : null,
        nextLink: hasNextPage ? `/api/services?page=${nextPage}&limit=${limit}` : null
    };
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