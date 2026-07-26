import fs from 'fs/promises';
import path from 'path';

import { ServiceManager } from './ServiceManager.js';

import { fileURLToPath } from 'url';
import { findById } from '../utils/findById.js';
import { newId } from '../utils/newId.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RUTA_RESERVAS = path.join(__dirname, '../data/bookings.json');

export class BookingManager {
    #serviceManager;

    constructor() {
        this.#serviceManager = new ServiceManager();
    }

    async #readBooking(){
        try{
            const data = await fs.readFile(RUTA_RESERVAS, 'utf-8');
            return JSON.parse(data);
        }
        catch(error){
            throw new Error (`Hubo un error al leer las reservas: ${error.message}`);
        }
    }

    async #saveBookings(bookings){
        await fs.writeFile(RUTA_RESERVAS, JSON.stringify(
            bookings,
            null,
            2
        ), 'utf-8');
    }

    async createBooking(bookingData){
        let bookings = await this.#readBooking();

        const camposRequeridos = ['clientName', 'clientEmail', 'date', 'time', 'status'];

        const camposFaltantes = camposRequeridos.filter( campo => {
            const valor = bookingData[campo];
            return valor === undefined || valor === null || valor === '';
        });
        if ( camposFaltantes.length > 0) {
            return { error: `Faltan campos obligatorios: ${camposFaltantes.join(', ')}` };
        }

        const { id: _idIgnorado, ...datosLimpios } = bookingData;
        const nuevaReserva = {
            ...datosLimpios,
            id: newId(bookings),
            services: bookingData.services ?? []
        }

        bookings.push(nuevaReserva);
        await this.#saveBookings(bookings);
        console.log('Nueva reserva creada');
        return nuevaReserva;
    }

    async getBookingById(id){
        const bookings = await this.#readBooking();
        return findById(id, bookings);
    }

   async addServiceToBooking(bid, sid) {
    
        let bookings = await this.#readBooking();
        let booking = findById(bid, bookings);
        if (!booking) {
            return { error: 'Reserva no encontrada' };
        }
        if(!Array.isArray(booking.services)){
            booking.services = [];
        }
        const service = await this.#serviceManager.getServiceById(sid);
        if (!service) {
            return { error: 'Servicio no encontrado' };
        }

        let itemExistente = booking.services.find(item => item.service === Number(sid));
        if (itemExistente) {
            itemExistente.quantity += 1;
        } 
        else {
            booking.services.push({ service: Number(sid), quantity: 1 });
        }

        const bookingsActualizados = bookings.map(b => b.id === Number(bid) ? booking : b);
        await this.#saveBookings(bookingsActualizados);
        return booking;
    }
}
