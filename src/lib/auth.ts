import bcrypt from 'bcryptjs';
import { getUsersCollection } from './mongodb';
import { User } from '@/types';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsersCollection();
  return (await users.findOne({ email })) as User | null;
}

export async function createUser(userData: {
  email: string;
  password: string;
  name: string;
}): Promise<User> {
  const users = await getUsersCollection();
  const hashedPassword = await hashPassword(userData.password);
  
  const newUser: Omit<User, '_id'> = {
    email: userData.email,
    password: hashedPassword,
    name: userData.name,
    role: 'user',
    emergencyContacts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await users.insertOne(newUser);
  return {
    ...newUser,
    _id: result.insertedId.toString(),
  } as User;
}

