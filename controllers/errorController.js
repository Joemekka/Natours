const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}: is ${err.value}`;
  return new AppError(message, 404);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value`;

  return new AppError(message, 404);
};

const handleValidationError = (err) => {
  const error = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${error.join('. ')}`;

  return new AppError(message, 400);
};

const handleJwtError = () =>
  new AppError('Invalid token, Please log in again', 401);

const handleTokenError = () =>
  new AppError('Token expired. Please try again', 401);

const sendErrorDev = (err, req, res) => {
  // A. API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B. RENDERD WEBSITE
  console.log('ERROR🔥🔥', err);
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A. API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, if trusted error, send message to client
    if (err.isOperational) {
      // A.
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B.
    console.log('ERROR🔥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  // B. Rendering website
  // Operational, if trusted error, send message to client
  if (err.isOperational) {
    // A.
    console.log('ERROR🔥🔥', err);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  // Programming or other unknown error: dont leak error details for security purpose
  // B. Send genric message
  console.log('ERROR🔥🔥🔥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Invalid tour name, Please try another tour!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') err = handleJwtError();
    if (err.name === 'TokenExpiredError') err = handleTokenError();

    sendErrorProd(err, req, res);
  }
};
