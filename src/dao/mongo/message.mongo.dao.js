import { MessageModel } from "../models/message.model.js";

export async function getAll() {
    return await MessageModel.find({});
}

export async function create(data){
    return await MessageModel.create(data);
}
