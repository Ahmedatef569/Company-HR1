const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const supabase = require('../config/supabase');
const { AppError } = require('../utils/appError');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.use(authController.protect);

// User management routes (admin only)
router.get(
    '/users',
    authController.restrictTo('master_admin', 'secondary_admin'),
    async (req, res, next) => {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) {
            return next(new AppError('Error fetching users', 500));
        }
        res.status(200).json({
            status: 'success',
            data: { users: data.users }
        });
    }
);

module.exports = router;
