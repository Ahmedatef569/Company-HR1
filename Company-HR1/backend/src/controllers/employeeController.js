const { AppError, AsyncHandler } = require('../utils/appError');
const supabase = require('../config/supabase');

exports.getAllEmployees = AsyncHandler.catchAsync(async (req, res) => {
    const { data: employees, error } = await supabase
        .from('employees')
        .select('*');

    if (error) {
        return next(new AppError('Error fetching employees', 500));
    }

    res.status(200).json({
        status: 'success',
        results: employees.length,
        data: {
            employees
        }
    });
});

exports.getEmployee = AsyncHandler.catchAsync(async (req, res, next) => {
    const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', req.params.id)
        .single();

    if (error || !employee) {
        return next(new AppError('Employee not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            employee
        }
    });
});

exports.createEmployee = AsyncHandler.catchAsync(async (req, res, next) => {
    const {
        employeeId,
        email,
        fullName,
        department,
        managerId,
        role = 'employee'
    } = req.body;

    // Validate role
    if (!['employee', 'manager'].includes(role)) {
        return next(new AppError('Invalid role specified', 400));
    }

    // Check if employee already exists
    const { data: existingEmployee, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
        return next(new AppError('Error checking existing employee', 500));
    }

    if (existingEmployee) {
        return next(new AppError('Employee with this ID already exists', 400));
    }

    // Create employee record
    const { data: newEmployee, error: insertError } = await supabase
        .from('employees')
        .insert([{
            employee_id: employeeId,
            email,
            full_name: fullName,
            department,
            manager_id: managerId,
            role,
            created_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (insertError) {
        return next(new AppError('Error creating employee account', 500));
    }

    res.status(201).json({
        status: 'success',
        data: {
            employee: newEmployee
        }
    });
});

exports.updateEmployee = AsyncHandler.catchAsync(async (req, res, next) => {
    const {
        email,
        fullName,
        department,
        managerId
    } = req.body;

    // Update employee record
    const { data: employee, error } = await supabase
        .from('employees')
        .update({
            full_name: fullName,
            department,
            manager_id: managerId,
            updated_at: new Date().toISOString()
        })
        .eq('employee_id', req.params.id)
        .select()
        .single();

    if (error || !employee) {
        return next(new AppError('Error updating employee', 400));
    }

    // If email is being updated, update auth user email
    if (email) {
        const { error: authError } = await supabase.auth.admin.updateUserById(
            employee.id,
            { email }
        );

        if (authError) {
            return next(new AppError('Error updating employee email', 400));
        }
    }

    res.status(200).json({
        status: 'success',
        data: {
            employee
        }
    });
});

exports.deleteEmployee = AsyncHandler.catchAsync(async (req, res, next) => {
    const { error } = await supabase
        .from('employees')
        .delete()
        .eq('employee_id', req.params.id);

    if (error) {
        return next(new AppError('No employee found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getTeamMembers = AsyncHandler.catchAsync(async (req, res, next) => {
    // Verify that the requester is the manager or has admin rights
    if (req.user.role === 'manager' && req.user.employeeId !== req.params.managerId) {
        return next(new AppError('You can only view your own team members', 403));
    }

    const { data: teamMembers, error } = await supabase
        .from('employees')
        .select('*')
        .eq('manager_id', req.params.managerId);

    if (error) {
        return next(new AppError('Error fetching team members', 500));
    }

    res.status(200).json({
        status: 'success',
        results: teamMembers.length,
        data: {
            teamMembers
        }
    });
});
