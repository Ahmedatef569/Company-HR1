const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8,
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: ['master_admin', 'secondary_admin', 'manager', 'employee'],
        default: 'employee'
    },
    employeeId: {
        type: String,
        unique: true,
        sparse: true // Allow null values (for admin users)
    },
    department: {
        type: String,
        required: function() {
            return this.role === 'employee' || this.role === 'manager';
        }
    },
    managerId: {
        type: String,
        required: function() {
            return this.role === 'employee';
        },
        sparse: true
    },
    permissions: {
        type: [{
            type: String,
            enum: [
                'view_all',
                'edit_all',
                'view_payroll',
                'edit_payroll',
                'view_leaves',
                'approve_leaves',
                'view_overtime',
                'approve_overtime',
                'view_excuses',
                'approve_excuses',
                'view_team',
                'manage_team'
            ]
        }],
        default: []
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Set default permissions based on role
userSchema.pre('save', function(next) {
    if (this.isModified('role')) {
        switch (this.role) {
            case 'master_admin':
                this.permissions = [
                    'view_all', 'edit_all',
                    'view_payroll', 'edit_payroll',
                    'view_leaves', 'approve_leaves',
                    'view_overtime', 'approve_overtime',
                    'view_excuses', 'approve_excuses',
                    'view_team', 'manage_team'
                ];
                break;
            case 'secondary_admin':
                this.permissions = [
                    'view_all', 'edit_all',
                    'view_leaves', 'approve_leaves',
                    'view_overtime', 'approve_overtime',
                    'view_excuses', 'approve_excuses',
                    'view_team', 'manage_team'
                ];
                break;
            case 'manager':
                this.permissions = [
                    'view_team', 'manage_team',
                    'view_leaves', 'approve_leaves',
                    'view_overtime', 'approve_overtime',
                    'view_excuses', 'approve_excuses'
                ];
                break;
            case 'employee':
                this.permissions = [
                    'view_leaves',
                    'view_overtime',
                    'view_excuses'
                ];
                break;
        }
    }
    next();
});

// Method to check if password is correct
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if user has required permissions
userSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
