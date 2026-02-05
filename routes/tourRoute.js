const express = require('express');
const tourContoller = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reveiewRouter = require('./reviewRoute');

const router = express.Router();

// router.param('id', tourContoller.checkID);

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reveiewController.createReview,
//   );

router.use('/:tourId/reviews', reveiewRouter);

router
  .route('/top-5-cheap')
  .get(tourContoller.top5Alias, tourContoller.getAllTours);

router.route('/get-stat').get(tourContoller.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourContoller.getMonthlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourContoller.getToursWithin);

router
  .route('/')
  .get(tourContoller.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourContoller.createTour,
  );

router.route('/distances/:latlng/unit/:unit').get(tourContoller.getDistance);

router
  .route('/:id')
  .get(tourContoller.getSingleTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourContoller.uploadTourImages,
    tourContoller.resizeTourImages,
    tourContoller.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourContoller.deleteTour,
  );
//

module.exports = router;
