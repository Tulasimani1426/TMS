import { db } from './db';
import { users } from '@shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDatabase() {
  // Check if admin user already exists
  const existingUser = await db.select().from(users).where(eq(users.username, 'admin'));
  
  if (existingUser.length === 0) {
    console.log('Seeding initial admin user');
    
    const adminUser = {
      username: "admin",
      password: await hashPassword("adminpassword"), 
      name: "Admin User",
      role: "Administrator",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
    };
    
    await db.insert(users).values(adminUser);
    console.log('Admin user created successfully');
  } else {
    console.log('Admin user already exists, skipping seed');
  }
}

export default seedDatabase;