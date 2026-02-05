const express = require('express');
const reviewController = require('../controllers/reviewsController');
const authController = require('../controllers/authController');
const deleteController = require('../controllers/reviewsController');

const router = express.Router({ mergeParams: true });

// POST /tour/1234abc/reviews
// GET /tour/1234abc/reviews
//

// Prevent anyone from creating review etc

router.use(authController.protect);

router
  .route('/')
  .get(authController.restrictTo('user'), reviewController.getReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserId,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(deleteController.deleteReview);

module.exports = router;
