const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleSignup, googleLoginEndpoint, updateProfile, deleteAccount, generateAndSendOtp, verifyOtpOnly, forgotPasswordSendOtp, forgotPasswordVerifyOtp, resetPassword } = require('../controllers/authController');

// Map API endpoints to their respective Controller functions
router.post('/register', registerUser);
router.post('/send-otp', generateAndSendOtp);
router.post('/verify-otp', verifyOtpOnly);
router.post('/forgot-password/send-otp', forgotPasswordSendOtp);
router.post('/forgot-password/verify-otp', forgotPasswordVerifyOtp);
router.post('/reset-password', resetPassword);
router.post('/login', loginUser);
router.post('/google/signup', googleSignup);
router.post('/google/login', googleLoginEndpoint);
router.put('/profile/:id', updateProfile);
router.delete('/account/:id', deleteAccount);

module.exports = router;
