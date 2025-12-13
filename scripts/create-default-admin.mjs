/**
 * Script to create the default admin user
 * Run with: node scripts/create-default-admin.mjs
 * Or: npm run setup:admin
 * 
 * Make sure to set MONGODB_URI in your environment or .env.local file
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local or .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile(filePath) {
  try {
    const envFile = readFileSync(filePath, 'utf8');
    envFile.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    });
  } catch (e) {
    // File doesn't exist, that's okay
  }
}

// Try to load .env.local first, then .env
const projectRoot = resolve(__dirname, '..');
loadEnvFile(resolve(projectRoot, '.env.local'));
loadEnvFile(resolve(projectRoot, '.env'));

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@delphi.health';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || 'Default Admin';

// MongoDB connection
let client;
let clientPromise;

function getMongoClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local or set MONGODB_URI environment variable');
  }

  if (clientPromise) {
    return clientPromise;
  }

  const uri = process.env.MONGODB_URI;
  client = new MongoClient(uri);
  clientPromise = client.connect();
  return clientPromise;
}

async function getUsersCollection() {
  const client = await getMongoClient();
  const db = client.db('delphi_healthcare');
  return db.collection('users');
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function getUserByEmail(email) {
  const users = await getUsersCollection();
  return await users.findOne({ email });
}

async function createAdminUser(userData) {
  const users = await getUsersCollection();
  const hashedPassword = await hashPassword(userData.password);
  
  const newUser = {
    email: userData.email,
    password: hashedPassword,
    name: userData.name,
    role: 'admin',
    emergencyContacts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await users.insertOne(newUser);
  return {
    ...newUser,
    _id: result.insertedId.toString(),
  };
}

async function createDefaultAdmin() {
  try {
    console.log('Checking for existing admin user...');
    
    // Check if default admin already exists
    const existingAdmin = await getUserByEmail(DEFAULT_ADMIN_EMAIL);
    if (existingAdmin) {
      console.log('✅ Default admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      return;
    }

    console.log('Creating default admin user...');
    
    // Create default admin user
    const adminUser = await createAdminUser({
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      name: DEFAULT_ADMIN_NAME,
    });

    console.log('✅ Default admin user created successfully!');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log('\n⚠️  IMPORTANT: Please change the default password after first login!');
    console.log(`   Default credentials:`);
    console.log(`   Email: ${DEFAULT_ADMIN_EMAIL}`);
    console.log(`   Password: ${DEFAULT_ADMIN_PASSWORD}`);
  } catch (error) {
    console.error('❌ Failed to create default admin user:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    // Close MongoDB connection
    if (client) {
      await client.close();
    }
  }
}

// Run the script
createDefaultAdmin()
  .then(() => {
    console.log('\n✅ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
