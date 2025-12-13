import { NextResponse } from 'next/server';
import { createAdminUser, getUserByEmail } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';

// Default admin credentials (should be changed after first login)
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@delphi.health';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || 'Default Admin';

export async function POST(request: Request) {
  try {
    // Security: Only allow creating default admin if no admins exist
    // This prevents unauthorized admin creation after initial setup
    const users = await getUsersCollection();
    const adminCount = await users.countDocuments({ role: 'admin' });
    
    if (adminCount > 0) {
      // If admins exist, require authentication
      // For now, we'll just check if the default admin exists
      const existingAdmin = await getUserByEmail(DEFAULT_ADMIN_EMAIL);
      if (existingAdmin) {
        return NextResponse.json(
          { 
            message: 'Default admin user already exists',
            email: DEFAULT_ADMIN_EMAIL,
            exists: true
          },
          { status: 200 }
        );
      }
      // If other admins exist but not the default one, return error
      return NextResponse.json(
        { 
          error: 'Admin users already exist. Please use an existing admin account to create additional admins.',
        },
        { status: 403 }
      );
    }

    // Check if default admin already exists (double check)
    const existingAdmin = await getUserByEmail(DEFAULT_ADMIN_EMAIL);
    if (existingAdmin) {
      return NextResponse.json(
        { 
          message: 'Default admin user already exists',
          email: DEFAULT_ADMIN_EMAIL,
          exists: true
        },
        { status: 200 }
      );
    }

    // Create default admin user
    const adminUser = await createAdminUser({
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      name: DEFAULT_ADMIN_NAME,
    });

    return NextResponse.json(
      { 
        message: 'Default admin user created successfully',
        email: adminUser.email,
        name: adminUser.name,
        warning: 'Please change the default password after first login'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create default admin error:', error);
    return NextResponse.json(
      { error: 'Failed to create default admin user' },
      { status: 500 }
    );
  }
}

