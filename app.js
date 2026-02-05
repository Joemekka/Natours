const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');
const boookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Global Middleware

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//app.use(helmet());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'https://js.stripe.com/'],
        scriptSrc: ["'self'", 'https://js.stripe.com/v3/'],
        styleSrc: [
          "'self'",
          'https://fonts.googleapis.com',
          "'unsafe-inline'",
          'https://js.stripe.com',
        ],
        fontSrc: ["'self'", 'https:', 'data:'],
        frameSrc: [
          "'self'",
          'https://js.stripe.com',
          'https://checkout.stripe.com',
        ],
        imgSrc: [
          "'self'",
          'data:',
          'https://*.tile.openstreetmap.org',
          'https://maps.geoapify.com',
          'https://cdn.jsdelivr.net',
          'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js',
          'https://fonts.googleapis.com',
          'https://api.stripe.com',
        ],
        connectSrc: [
          "'self'",
          '/api/v1/user/login',
          '/api/send',
          '/api/v1/user/login',
          '/api/send',
          'ws://localhost:*',
          'ws://127.0.0.1:*',
        ],
      },
    },
  }),
);

// Develpoment loggin
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'You hit too many request, try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSql query injection
app.use(mongoSanitize());

// Data sanitazation aagainst XSS
app.use(xss());

// Preventing parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'maxGroupSize',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
    ],
  }),
);

// Compress texts middleware
app.use(compression());
// Middleware 3
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//app.get('/api/v1/tours', getAllTours);
//app.post('/api/v1/tours', createTour);

// ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/booking', boookingRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'failed',
  //   message: `Cant find ${req.originalUrl} on our server`,
  // });

  next(new AppError(`Cant find ${req.originalUrl} on our server`), 404);
});

app.use(globalErrorHandler);

module.exports = app;
