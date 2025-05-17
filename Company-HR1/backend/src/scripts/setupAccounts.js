const supabase = require('../config/supabase');

const setupInitialAccounts = async () => {
    try {
        // Create master admin account
        const { error: masterAdminError } = await supabase.auth.signUp({
            email: 'admin@company.internal',
            password: 'admin123',
            options: {
                data: {
                    username: 'admin',
                    role: 'master_admin',
                    employeeId: 'ADMIN',
                    permissions: [
                        'view_all', 'edit_all',
                        'view_payroll', 'edit_payroll',
                        'view_leaves', 'approve_leaves',
                        'view_overtime', 'approve_overtime',
                        'view_excuses', 'approve_excuses',
                        'view_team', 'manage_team'
                    ],
                    fullName: 'Master Admin',
                    department: 'Administration'
                }
            }
        });

        if (masterAdminError) throw masterAdminError;
        console.log('✅ Master admin account created');

        // Create secondary admin account
        const { error: secondaryAdminError } = await supabase.auth.signUp({
            email: 'admin1@company.internal',
            password: 'admin1123',
            options: {
                data: {
                    username: 'admin1',
                    role: 'secondary_admin',
                    employeeId: 'ADMIN1',
                    permissions: [
                        'view_all', 'edit_all',
                        'view_leaves', 'approve_leaves',
                        'view_overtime', 'approve_overtime',
                        'view_excuses', 'approve_excuses',
                        'view_team', 'manage_team'
                    ],
                    fullName: 'Secondary Admin',
                    department: 'Administration'
                }
            }
        });

        if (secondaryAdminError) throw secondaryAdminError;
        console.log('✅ Secondary admin account created');

        console.log('\nInitial accounts setup completed successfully!');
        console.log('\nMaster Admin Account:');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('\nSecondary Admin Account:');
        console.log('Username: admin1');
        console.log('Password: admin1123');
        
    } catch (error) {
        console.error('Error setting up initial accounts:', error.message);
    }
    process.exit(0);
};

setupInitialAccounts();
