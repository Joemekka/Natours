const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const Tour = require('../../models/tourModel');
const Reviews = require('../../models/reviewModel');
const User = require('../../models/userModel');

const tourPath = path.join(__dirname, 'tours.json');
const userPath = path.join(__dirname, 'users.json');
const reviewPath = path.join(__dirname, 'reviews.json');

dotenv.config({ path: './config.env' });

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD,
// );

const DB = process.env.MONGO_URI.replace(
  '<PASSWORD>',
  process.env.MONGO_PASSWORD,
);

//const DB = process.env.DATABAS_LOCAL;
mongoose.connect(DB).then(() => {
  console.log('DB Connection Successful');
});

// READ FILE
const users = JSON.parse(fs.readFileSync(userPath, 'utf-8'));
const tours = JSON.parse(fs.readFileSync(tourPath, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(reviewPath, 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours, { validateBeforeSave: false });
    // await User.create(users, { validateBeforeSave: false });
    // await Reviews.create(reviews);
    console.log('Data successfully executed');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    // await User.deleteMany();
    // await Reviews.deleteMany();
    await Tour.deleteMany();
    console.log('Data succesfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
