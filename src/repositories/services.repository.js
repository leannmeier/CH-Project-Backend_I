import * as servicesDao from '../dao/mongo/service.mongo.dao.js';

export async function getAll(){
    return await servicesDao.getAll();
}

export async function getById(id){
    return await servicesDao.getById(id);
}

export async function create(data){
    return await servicesDao.create(data);
}

export async function update(id, updateData){
    return await servicesDao.update(id, updateData);
}

export async function _delete(id){
    return await servicesDao._delete(id);
}