const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getUserProfile,
    updateUserProfile,
    completeOnboarding,
    deleteAccount
} = require('../controllers/userController');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/complete-onboarding', protect, completeOnboarding);
router.delete('/account', protect, deleteAccount);

module.exports = router;
