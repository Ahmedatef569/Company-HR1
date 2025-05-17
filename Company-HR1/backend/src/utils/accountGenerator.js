const supabase = require('../config/supabase');

const generateEmployeeAccount = async (employeeId, fullName, department, managerId = null) => {
    try {
        const { error } = await supabase.auth.signUp({
            email: `${employeeId}@company.internal`,
            password: 'user123',
            options: {
                data: {
                    username: employeeId,
                    role: 'employee',
                    employeeId,
                    permissions: [
                        'view_leaves',
                        'view_overtime',
                        'view_excuses'
                    ],
                    fullName,
                    department,
                    managerId
                }
            }
        });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error(`Error creating employee account for ${employeeId}:`, error.message);
        return false;
    }
};

const generateManagerAccount = async (managerId, fullName, department) => {
    try {
        const { error } = await supabase.auth.signUp({
            email: `${managerId}@company.internal`,
            password: 'manager123',
            options: {
                data: {
                    username: managerId,
                    role: 'manager',
                    employeeId: managerId,
                    permissions: [
                        'view_team', 'manage_team',
                        'view_leaves', 'approve_leaves',
                        'view_overtime', 'approve_overtime',
                        'view_excuses', 'approve_excuses'
                    ],
                    fullName,
                    department
                }
            }
        });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error(`Error creating manager account for ${managerId}:`, error.message);
        return false;
    }
};

module.exports = {
    generateEmployeeAccount,
    generateManagerAccount
};
