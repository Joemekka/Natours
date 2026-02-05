const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Allow only logged in users middleware
router.use(authController.protect);

router.patch('/update-password', authController.updatePassword);
router.patch(
  '/update-me',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);
router.delete('/delete-user', userController.deleteUser);

// Allow only admin to perfom these tasks middleware
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUser)
  .post(userController.createUser);

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser,
);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
