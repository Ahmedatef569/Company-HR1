const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const employeeController = require('../controllers/employeeController');

// All routes require authentication
router.use(authController.protect);

// Test endpoints for different permissions
router.get('/test/payroll', 
    authController.checkPermission('view_payroll'),
    (req, res) => {
        res.status(200).json({
            status: 'success',
            message: 'You have access to payroll data',
            user: req.user
        });
    }
);

router.get('/test/team-management',
    authController.checkPermission('view_team'),
    (req, res) => {
        res.status(200).json({
            status: 'success',
            message: 'You have access to team management',
            user: req.user
        });
    }
);

router.get('/test/leave-approval',
    authController.checkPermission('approve_leaves'),
    (req, res) => {
        res.status(200).json({
            status: 'success',
            message: 'You have access to leave approval',
            user: req.user
        });
    }
);

router.get('/test/basic-access',
    authController.checkPermission('view_leaves'),
    (req, res) => {
        res.status(200).json({
            status: 'success',
            message: 'You have basic access',
            user: req.user
        });
    }
);

// Employee management routes
router.route('/')
    .get(
        authController.checkPermission('view_all'),
        employeeController.getAllEmployees
    )
    .post(
        authController.restrictTo('master_admin', 'secondary_admin'),
        authController.checkPermission('edit_all'),
        employeeController.createEmployee
    );

router.route('/:id')
    .get(
        authController.checkPermission('view_all'),
        employeeController.getEmployee
    )
    .patch(
        authController.restrictTo('master_admin', 'secondary_admin'),
        authController.checkPermission('edit_all'),
        employeeController.updateEmployee
    )
    .delete(
        authController.restrictTo('master_admin'),
        authController.checkPermission('edit_all'),
        employeeController.deleteEmployee
    );

// Manager-specific routes
router.get(
    '/team/:managerId',
    authController.checkPermission('view_team'),
    employeeController.getTeamMembers
);

module.exports = router;
