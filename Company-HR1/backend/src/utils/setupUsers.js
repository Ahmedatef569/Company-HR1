const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/config');

const createInitialUsers = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connected to MongoDB successfully');

        // Create master admin account
        await User.findOneAndUpdate(
            { username: 'admin' },
            {
                username: 'admin',
                email: 'admin@company.com',
                password: 'admin123',
                role: 'master_admin'
            },
            { upsert: true, new: true, runValidators: true }
        );

        // Create secondary admin account
        await User.findOneAndUpdate(
            { username: 'admin1' },
            {
                username: 'admin1',
                email: 'admin1@company.com',
                password: 'admin1123',
                role: 'secondary_admin'
            },
            { upsert: true, new: true, runValidators: true }
        );

        console.log('Initial admin accounts created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating initial users:', error);
        process.exit(1);
    }
};

// Function to create or update employee account
const createEmployeeAccount = async (employeeData) => {
    try {
        const { employeeId, email, fullName, department, managerId } = employeeData;
        
        await User.findOneAndUpdate(
            { employeeId },
            {
                username: employeeId,
                email,
                password: 'user123',
                role: 'employee',
                employeeId,
                department,
                managerId,
                fullName
            },
            { upsert: true, new: true, runValidators: true }
        );
        
        return true;
    } catch (error) {
        console.error(`Error creating employee account for ${employeeData.employeeId}:`, error);
        return false;
    }
};

// Function to create or update manager account
const createManagerAccount = async (managerData) => {
    try {
        const { employeeId, email, fullName, department } = managerData;
        
        await User.findOneAndUpdate(
            { employeeId },
            {
                username: employeeId,
                email,
                password: 'manager123',
                role: 'manager',
                employeeId,
                department,
                fullName
            },
            { upsert: true, new: true, runValidators: true }
        );
        
        return true;
    } catch (error) {
        console.error(`Error creating manager account for ${managerData.employeeId}:`, error);
        return false;
    }
};

module.exports = {
    createInitialUsers,
    createEmployeeAccount,
    createManagerAccount
};
