const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review must be provided'],
    },
    rating: {
      type: Number,
      required: [true, 'Ratings is required'],
      min: [1, 'Rating must not be less than 1'],
      max: [5, 'Rating must not be above 5'],
    },
    createAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Reveiw must belong to a user'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// reviewSchema.pre(/^find/, function () {
//   this.populate([
//     { path: 'user', select: '-__v  -name' },
//     { path: 'tour', select: '-__v -name' },
//   ]);
// });

reviewSchema.pre(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
});

reviewSchema.statics.calcAveragerating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

reviewSchema.post('save', function () {
  // this points to current document
  this.constructor.calcAveragerating(this.tour);
});

// reviewSchema.pre(/^findOneAnd/, function () {
//   const r = this.findOne();
//   console.log(r);
// });

reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (!doc) return;
  await doc.constructor.calcAveragerating(doc.tour);
});

// reviewSchema.pre(/^findOneAnd/, function () {
//   // this.findOne(): This wont work, query has already executed
//   this.r.constructor.calcAveragerating(this.r.tour);
// });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
