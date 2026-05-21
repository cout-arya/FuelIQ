const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { cacheRoute } = require('../middleware/cacheMiddleware');
const {
    getUserProfile,
    updateUserProfile,
    completeOnboarding,
    deleteAccount
} = require('../controllers/userController');

router.get('/profile', protect, cacheRoute(3600), getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/complete-onboarding', protect, completeOnboarding);
router.delete('/account', protect, deleteAccount);

module.exports = router;
