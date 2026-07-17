export function newId(arr){
    return arr.length > 0 
    ? Math.max(...arr.map(s => s.id)) + 1 
    : 1;
}