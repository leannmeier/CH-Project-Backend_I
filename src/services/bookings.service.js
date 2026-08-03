import * as bookingsRepository from '../repositories/bookings.repository.js';
import * as servicesService from '../services/services.service.js';

const camposRequeridos = ['clientName', 'clientEmail', 'date', 'time', 'status'];

export async function createBooking(booking){
    const bookings = await bookingsRepository.getAll();
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
    return await bookingsRepository.getById(id);
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
    let itemExistente = booking.services.find(b => b.service === Number(sid));
    if(itemExistente) {
        itemExistente.quantity += 1;
    }
    else{
        booking.services.push({ service: Number(sid), quantity: 1 });
    }
    return await bookingsRepository.update(bid, booking);

}