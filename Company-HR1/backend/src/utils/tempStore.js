// Temporary in-memory data store for preview
const store = {
    users: new Map(),
    init() {
        // Add default admin users
        this.users.set('admin', {
            _id: '1',
            username: 'admin',
            email: 'admin@company.com',
            password: '$2a$12$q7Xl0TA6/rH8Fm2pRncC8.KpCz.qkHEYBVzBRqRNQ9ZIBtEyPKhb2', // hashed 'admin123'
            role: 'master_admin',
            permissions: [
                'view_all', 'edit_all',
                'view_payroll', 'edit_payroll',
                'view_leaves', 'approve_leaves',
                'view_overtime', 'approve_overtime',
                'view_excuses', 'approve_excuses',
                'view_team', 'manage_team'
            ]
        });

        this.users.set('admin1', {
            _id: '2',
            username: 'admin1',
            email: 'admin1@company.com',
            password: '$2a$12$LQrP7PWBBk0E9LFf1eNkteQUE.kNyy4oHXWM3VHBcNC0LxHuahZgG', // hashed 'admin1123'
            role: 'secondary_admin',
            permissions: [
                'view_all', 'edit_all',
                'view_leaves', 'approve_leaves',
                'view_overtime', 'approve_overtime',
                'view_excuses', 'approve_excuses',
                'view_team', 'manage_team'
            ]
        });
    },
    findUser(username) {
        return this.users.get(username);
    },
    addUser(userData) {
        this.users.set(userData.username, userData);
        return userData;
    },
    updateUser(username, userData) {
        if (this.users.has(username)) {
            this.users.set(username, { ...this.users.get(username), ...userData });
            return this.users.get(username);
        }
        return null;
    },
    deleteUser(username) {
        return this.users.delete(username);
    },
    getAllUsers() {
        return Array.from(this.users.values());
    }
};

module.exports = store;
