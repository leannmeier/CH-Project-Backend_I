import * as bookingsRepository from '../repositories/bookings.repository.js';
import * as servicesService from '../services/services.service.js';

const camposRequeridos = ['clientName', 'clientEmail', 'date', 'time', 'status'];

export async function createBooking(booking){
    const faltantes = camposRequeridos.filter( b => {
        const valor = booking[b];
        return valor === undefined ||  valor === null || valor === '';
    })
    if(faltantes.length > 0) {
        return { error: `Faltan campos obligatorios: ${faltantes.join(', ')}` };
    }
    return await bookingsRepository.create(booking);
}

export async function getBookingById(id){
    return await bookingsRepository.getByIdPopulated(id);
}

export async function addServiceToBooking(bid, sid){
    let booking = await bookingsRepository.getById(bid);
    if (!booking) {
        return { error: 'Reserva no encontrada' };
    }
    if(!Array.isArray(booking.services)){
        booking.services = [];
    }
    let service = await servicesService.getServiceById(sid);
    if (!service) {
        return { error: 'Servicio no encontrado' };
    }
    let itemExistente = booking.services.find(b => String(b.service) === String(sid));
    if(itemExistente) {
        itemExistente.quantity += 1;
    }
    else{
        booking.services.push({ service: sid, quantity: 1 });
    }
    return await bookingsRepository.update(bid, booking);
}

export async function deleteServiceToBooking(bid, sid){
    let booking = await bookingsRepository.getById(bid);
    if (!booking) {
        return { error: 'Reserva no encontrada' };
    }
    let service = booking.services.find(s => String(s.service) === String(sid));
    if (!service) {
        return { error: 'Servicio no encontrado dentro de la reserva' };
    }
    return await bookingsRepository.removeService(bid, sid);
}

export async function updateQuantity(bid, sid, quantity){
    let booking = await bookingsRepository.getById(bid);
    if (!booking) {
        return { error: 'Reserva no encontrada' };
    }
    let service = booking.services.find(s => String(s.service) === String(sid));
    if (!service) {
        return { error: 'Servicio no encontrado dentro de la reserva' };
    }
    if (quantity <= 0) {
        return { error: 'La cantidad de un servicio debe ser positiva' };
    }
    return await bookingsRepository.updateServiceQuantity(bid, sid, quantity);
}

export async function deleteBooking(bid){
    const booking = await bookingsRepository.getById(bid);
    if(!booking){
        return { error: 'Reserva no encontrada' };
    }
    return await bookingsRepository._delete(bid);
}