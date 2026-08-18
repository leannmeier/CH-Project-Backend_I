import * as bookingsDao from '../dao/mongo/booking.mongo.dao.js';

export async function getById(id){
    return await bookingsDao.getById(id);
}

export async function getByIdPopulated(id){
    return await bookingsDao.getByIdPopulated(id);
}

export async function create(data){
    return await bookingsDao.create(data);
}

export async function update(id, updateData) {
    return await bookingsDao.update(id, updateData);
}

export async function removeService(bid, sid){
    return await bookingsDao.removeService(bid, sid);
}

export async function updateServiceQuantity(bid, sid, quantity){
    return await bookingsDao.updateServiceQuantity(bid, sid, quantity);
}

export async function _delete(bid){
    return await bookingsDao._delete(bid);
}