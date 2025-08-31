const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@handwerk.de' }
    });

    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@handwerk.de',
        password: hashedPassword,
        name: 'Administrator'
      }
    });

    console.log('Admin user created successfully:', user.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
