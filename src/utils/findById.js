export function findById(id, arr){
    return arr.find(obj => obj.id === Number(id)) || null;
}