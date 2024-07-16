// routes/userRoutes.js
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.put('/', authMiddleware, userController.updateUser);
router.delete('/', authMiddleware, userController.deleteUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);


module.exports = router;