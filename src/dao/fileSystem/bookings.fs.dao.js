import fs from 'node:fs/promises';
import path from 'node:path'

import { fileURLToPath } from 'url';
import { findById } from '../../utils/findById.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RUTA_RESERVAS = path.join(__dirname, '../../data/bookings.json');

async function leer(){
    try{
        const data = await fs.readFile(RUTA_RESERVAS, 'utf-8');
        return JSON.parse(data);
    }
    catch(error){
        throw new Error (`Hubo un error al leer las reservas: ${error.message}`);
    }
}

async function guardar(bookings){
    try{
        await fs.writeFile(RUTA_RESERVAS, JSON.stringify(
            bookings,
            null,
            2
        ), 'utf-8') 
    }
    catch(error){
        throw new Error (`Hubo un error al guardar las reservas: ${error.message}`);
    }
}

export async function getAll(){
    return await leer();
}

export async function create(booking){
    let bookings = await leer();
    bookings.push(booking);
    await guardar(bookings);
    return booking;
}

export async function getById(id){
    const bookings = await leer();
    return findById(id, bookings);
}

export async function update(id, updateBooking){
    const bookings = await leer();
    const actualizarReserva = findById(id, bookings);
    if(actualizarReserva){
        const reservasActualizadas = bookings.map( b => b.id === Number(id) ? updateBooking : b );
        await guardar(reservasActualizadas);
    }
    return updateBooking;
}