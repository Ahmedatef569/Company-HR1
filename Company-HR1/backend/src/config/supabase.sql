-- Create employees table
create table public.employees (
    id uuid references auth.users on delete cascade,
    employee_id text unique not null,
    full_name text,
    department text,
    manager_id text references public.employees(employee_id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.employees enable row level security;

-- Create RLS policies
create policy "Users can view their own record"
    on public.employees for select
    using (auth.uid() = id);

create policy "Admins can view all records"
    on public.employees for select
    using (auth.jwt() ->> 'role' in ('master_admin', 'secondary_admin'));

create policy "Managers can view their team records"
    on public.employees for select
    using (
        auth.jwt() ->> 'role' = 'manager' and
        manager_id = (
            select employee_id 
            from public.employees 
            where id = auth.uid()
        )
    );

-- Create function to handle user registration
create or replace function public.handle_user_registration()
returns trigger as $$
begin
    insert into public.employees (id, employee_id, full_name, department)
    values (
        new.id,
        new.raw_user_meta_data->>'employeeId',
        new.raw_user_meta_data->>'fullName',
        new.raw_user_meta_data->>'department'
    );
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for user registration
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_user_registration();
