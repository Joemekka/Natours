/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have a length of 40'],
      minlength: [10, 'A tour must not be less than 10'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a goup size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty must be easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be not be less than 1'],
      max: [5, 'rating must not be greater than 5'],
      set: (val) => Math.round(val * 10) / 10, // 4.66666, 46.66666, 47, 47
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // this only point to the new document when creating, wont work on update()
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) must not be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        defaults: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          deafult: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guide: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE mongoose: runs before .save() and .continue() Note: this doesnt work for insertMany()

tourSchema.pre('save', async function () {
  this.slug = await slugify(this.name, { lower: true }); // the this points to the current processed document'
});

tourSchema.pre(/^find/, function () {
  this.populate({
    path: 'guide',
    select: '-__v -passwordChangedAt',
  });
});

// tourSchema.pre('save', async function () {
//   await console.log('Will save document');
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE mongoose:

// tourSchema.pre('find', function () {
//   this.find({ secretTour: { $ne: true } });
// });

tourSchema.pre(/^find/, function () {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds`);
  // console.log('DOC', doc);
  next();
});

// Aggregation middleware
// tourSchema.pre('aggregate', function () {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   console.log('This', this.pipeline());
// });

// tourSchema.pre('save', async function () {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
