import { BookingModel } from "../models/booking.model.js";

export async function create(data){
    return await BookingModel.create(data);
}

export async function getById(id){
    return await BookingModel.findById(id);
}

export async function getByIdPopulated(id){
    return await BookingModel.findById(id).populate(
        {
            path: 'services.service'
        }
    );
}

export async function update(id, data){
    return await BookingModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}   

export async function removeService(bid, sid){
    return await BookingModel.findByIdAndUpdate(
        bid,
        { $pull: { services: { service: sid } } }, 
        { new: true, runValidators: true }
    );
}

export async function updateServiceQuantity(bid, sid, quantity){
    return await BookingModel.findOneAndUpdate(
        { _id: bid, 'services.service': sid },
        { $set: { 'services.$.quantity': quantity }},
        { new: true, runValidators: true }
    );
}

export async function _delete(id){
    return await BookingModel.findByIdAndDelete(id,);
}