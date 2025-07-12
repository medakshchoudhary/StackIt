const mongoose = require('mongoose');
require('dotenv').config();

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Check if admin user exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
    } else {
      console.log('Creating admin user...');
      const adminUser = await User.create({
        username: 'admin',
        email: 'admin@stackit.com',
        password: 'password123',
        role: 'admin'
      });
      console.log('Admin user created:', adminUser.username);
    }
    
    // Check if regular user exists
    const existingUser = await User.findOne({ username: 'testuser' });
    if (!existingUser) {
      console.log('Creating test user...');
      const testUser = await User.create({
        username: 'testuser',
        email: 'test@stackit.com',
        password: 'password123',
        role: 'user'
      });
      console.log('Test user created:', testUser.username);
    }
    
    // List all users
    const allUsers = await User.find({});
    console.log('\nAll users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - ${user.role}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUsers();
