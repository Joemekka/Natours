const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingsController = require('../controllers/bookingsController');

const router = express.Router();

router.get('/', authController.isLoggin, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggin, viewsController.getTour);
router.get('/login', authController.isLoggin, viewsController.postLogin);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);

module.exports = router;
