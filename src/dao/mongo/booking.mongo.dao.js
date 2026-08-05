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