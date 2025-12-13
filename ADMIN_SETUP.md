# Admin User Setup Guide

This guide explains how to create default admin users and manage user roles in the DelphiX application.

## Creating the Default Admin User

There are two ways to create the default admin user:

### Method 1: Using the Admin Dashboard (Recommended)

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the admin page (you may need to sign in first if you have any user account)

3. Look for the "Default Admin Setup" section at the top of the admin dashboard

4. Click the "Create Default Admin" button

5. The default admin will be created with the following credentials (unless configured via environment variables):
   - **Email**: `admin@delphi.health`
   - **Password**: `admin123`
   - **Name**: `Default Admin`

⚠️ **Important**: Change the default password immediately after first login!

### Method 2: Using the CLI Script

1. Make sure your environment variables are set:
   ```bash
   # .env.local or .env
   MONGODB_URI=your_mongodb_connection_string
   DEFAULT_ADMIN_EMAIL=admin@delphi.health  # optional
   DEFAULT_ADMIN_PASSWORD=admin123  # optional
   DEFAULT_ADMIN_NAME=Default Admin  # optional
   ```

2. Run the setup script:
   ```bash
   npm run setup:admin
   ```
   
   Or directly with Node.js:
   ```bash
   node scripts/create-default-admin.mjs
   ```

3. The script will:
   - Check if the default admin already exists
   - Create the admin user if it doesn't exist
   - Display the credentials

## Making Users Admins

Once you have an admin account, you can promote other users to admin status:

1. Sign in as an admin user

2. Navigate to the Admin Dashboard (`/admin`)

3. Scroll down to the "Users" table

4. Find the user you want to make an admin

5. Click the "Make Admin" button next to their name

6. The user's role will be updated immediately

## Removing Admin Status

To remove admin status from a user:

1. Go to the Admin Dashboard

2. Find the user in the Users table

3. Click the "Remove Admin" button

⚠️ **Note**: You cannot remove your own admin status. This prevents you from accidentally locking yourself out.

## Environment Variables

You can customize the default admin credentials by setting these environment variables:

- `DEFAULT_ADMIN_EMAIL`: Email for the default admin (default: `admin@delphi.health`)
- `DEFAULT_ADMIN_PASSWORD`: Password for the default admin (default: `admin123`)
- `DEFAULT_ADMIN_NAME`: Display name for the default admin (default: `Default Admin`)

## Security Notes

- The default admin creation endpoint only works when no admin users exist in the system
- Once at least one admin exists, you must use an existing admin account to create additional admins
- Always change default passwords after first login
- Consider using strong, randomly generated passwords for production environments

## API Endpoints

### Create Default Admin
- **Endpoint**: `POST /api/admin/create-default-admin`
- **Auth**: Not required (only works when no admins exist)
- **Response**: Returns admin user details or error message

### Update User Role
- **Endpoint**: `PATCH /api/admin/users/[userId]`
- **Auth**: Required (admin only)
- **Body**: `{ "role": "admin" | "user" }`
- **Response**: Success message or error

### Get All Users
- **Endpoint**: `GET /api/admin/users`
- **Auth**: Required (admin only)
- **Response**: Array of user objects (passwords excluded)

