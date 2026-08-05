export function errorHandler(error, req, res, next){
    if(error.name === 'CastError'){
        res.status(400).json( { status: 'error', message: 'El id proporcionado no es valido' } );
    }
    if(error.name === 'ValidationError'){
        res.status(400).json( { status: 'error', message: error.message } );
    }
    console.log(error);
    res.status(500).json( { status:'error', message: 'Error interno del servidor' } );
}