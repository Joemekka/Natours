const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION: Shutting down...');
  process.exit(1);
});

dotenv.config({ path: `${__dirname}/config.env` });
const app = require('./app');

const DB = process.env.MONGO_URI.replace('<PASSWORD>', process.env.MONGO_PASS);

//const DB = process.env.DATABAS_LOCAL;
mongoose.connect(DB).then(() => {
  console.log('DB Connection Successful');
});

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`App running on port: ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION: Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
