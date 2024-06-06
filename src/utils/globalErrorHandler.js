const HttpStatusCode = require('../utils/httpStatusCodes');

const sentErrorDev = (err, req, res) => {
    err.statusCode = err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stackTrace: err.stack
    });
}

const sentErrorProd = (err, req, res) => {
    if(err.isOperational){
        err.statusCode = err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;
        err.status = err.status || 'error';
    
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
}

const globalErrorHandler = (err, req, res, next) => {
    if(process.env.NODE_ENV === "development"){
        sentErrorDev(err, req, res);
    } else if(process.env.NODE_ENV === "production"){
        err = err.name === 'CastError' ? handleCastErrorDB(err) : err;
        sentErrorProd(err, req, res);
    } else{
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
}

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, HttpStatusCode.BAD_REQUEST);
}

module.exports = globalErrorHandler