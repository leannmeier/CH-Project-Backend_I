import { ServiceModel } from '../models/service.model.js'

export async function getAll(){
    return await ServiceModel.find({});
}

export async function getById(id){
    return await ServiceModel.findById(id);
}

export async function create(data){
    return await ServiceModel.create(data);
}

export async function update(id, data){
    return await ServiceModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function _delete(id){
    return await ServiceModel.findByIdAndDelete(id);
}