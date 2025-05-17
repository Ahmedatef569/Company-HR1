# HR System Backend

A Node.js backend system for managing HR operations including employee management, authentication, and permissions.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Copy `.env.example` to `.env` and update the environment variables:
```bash
cp .env.example .env
```
4. Set up your Supabase database using the schema in `src/config/supabase.sql`
5. Update the Supabase credentials in your `.env` file
6. Run the setup script to create initial accounts:
```bash
node setup.js
```
7. Start the server:
```bash
npm start
```

## Features

- Authentication system with role-based permissions
- Employee management
- Team management
- Leave management
- Payroll access control

## API Documentation

See `postman_collection.json` for detailed API documentation and examples.

## Environment Variables

- `PORT`: Server port (default: 5001)
- `NODE_ENV`: Environment (development/production)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `CORS_ORIGIN`: Allowed CORS origin

## Project Structure

```
backend/
├── package.json        # Project dependencies and scripts
├── server.js          # Main application entry
├── setup.js           # Initial setup script
└── src/
    ├── config/        # Configuration files
    ├── controllers/   # Request handlers
    ├── middleware/    # Custom middleware
    ├── models/        # Data models
    ├── routes/        # API routes
    ├── scripts/       # Utility scripts
    └── utils/         # Helper functions
```
