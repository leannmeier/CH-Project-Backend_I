import * as bookingsDao from '../dao/fileSystem/bookings.fs.dao.js';
import { newId } from '../utils/newId.js';

export async function getAll(){
    return await bookingsDao.getAll();
}

export async function create(booking){
    const { id: _idIgnorado, ...datosLimpios } = booking
    let nuevaReserva = {
        ...datosLimpios,
        id: newId(await getAll())
    }
    return await bookingsDao.create(nuevaReserva);
}

export async function getById(id){
    return await bookingsDao.getById(id);
}

export async function update(id, updateBooking){
    return await bookingsDao.update(id, updateBooking);
}