export function errorHandler(error, req, res, next){
    console.log(error);
    res.status(500).json( { status:'error', message: 'Error interno del servidor' } );
}