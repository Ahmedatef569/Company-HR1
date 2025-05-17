const { AppError, AsyncHandler } = require('../utils/appError');
const supabase = require('../config/supabase');

// Helper function to get default permissions based on role
const getDefaultPermissions = (role) => {
    switch (role) {
        case 'master_admin':
            return [
                'view_all', 'edit_all',
                'view_payroll', 'edit_payroll',
                'view_leaves', 'approve_leaves',
                'view_overtime', 'approve_overtime',
                'view_excuses', 'approve_excuses',
                'view_team', 'manage_team'
            ];
        case 'secondary_admin':
            return [
                'view_all', 'edit_all',
                'view_leaves', 'approve_leaves',
                'view_overtime', 'approve_overtime',
                'view_excuses', 'approve_excuses',
                'view_team', 'manage_team'
            ];
        case 'manager':
            return [
                'view_team', 'manage_team',
                'view_leaves', 'approve_leaves',
                'view_overtime', 'approve_overtime',
                'view_excuses', 'approve_excuses'
            ];
        default:
            return [
                'view_leaves',
                'view_overtime',
                'view_excuses'
            ];
    }
};

exports.register = AsyncHandler.catchAsync(async (req, res, next) => {
    const { username, password, role = 'employee', employeeId, fullName, department } = req.body;

    // Generate email from username for Supabase (since it requires email)
    const email = `${username}@company.internal`;

    try {
        // Create user with Supabase
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    role,
                    employeeId: employeeId || username,
                    permissions: getDefaultPermissions(role),
                    fullName: fullName || username,
                    department: department || 'Administration'
                }
            }
        });

        if (signUpError) throw signUpError;

        // Automatically sign in after registration
        const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signInError) throw signInError;

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.user_metadata.role,
                    employeeId: user.user_metadata.employeeId,
                    permissions: user.user_metadata.permissions,
                    fullName: user.user_metadata.fullName,
                    department: user.user_metadata.department
                },
                token: session.access_token
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 400));
    }
});

exports.login = AsyncHandler.catchAsync(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(new AppError('Please provide username and password', 400));
    }

    // Convert username to internal email format
    const email = `${username}@company.internal`;

    try {
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: session.user.id,
                    email: session.user.email,
                    role: session.user.user_metadata.role,
                    employeeId: session.user.user_metadata.employeeId,
                    permissions: session.user.user_metadata.permissions,
                    fullName: session.user.user_metadata.fullName,
                    department: session.user.user_metadata.department
                },
                token: session.access_token
            }
        });
    } catch (error) {
        return next(new AppError('Incorrect email or password', 401));
    }
});

exports.protect = AsyncHandler.catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in. Please log in to get access', 401));
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) throw error;

        req.user = {
            id: user.id,
            email: user.email,
            role: user.user_metadata.role,
            permissions: user.user_metadata.permissions,
            employeeId: user.user_metadata.employeeId,
            fullName: user.user_metadata.fullName,
            department: user.user_metadata.department,
            hasPermission: function(permission) {
                return this.permissions.includes(permission);
            }
        };

        next();
    } catch (error) {
        return next(new AppError('Invalid token or expired session', 401));
    }
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

exports.checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user.permissions.includes(permission)) {
            return next(new AppError(`You do not have '${permission}' permission to perform this action`, 403));
        }
        next();
    };
};

module.exports = exports;
