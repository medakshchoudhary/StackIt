const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Simple User Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: { type: String, default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const createDemoUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Create demo users
        const users = [
            {
                username: 'john_doe',
                email: 'john@example.com',
                password: hashedPassword,
                role: 'user'
            },
            {
                username: 'jane_smith',
                email: 'jane@example.com',
                password: hashedPassword,
                role: 'user'
            },
            {
                username: 'admin_user',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin'
            }
        ];

        await User.deleteMany({}); // Clear existing users
        await User.insertMany(users);

        console.log('✅ Demo users created successfully!');
        console.log('\n📧 Demo Accounts:');
        console.log('Email: john@example.com | Password: password123');
        console.log('Email: jane@example.com | Password: password123');
        console.log('Email: admin@example.com | Password: password123 (Admin)');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createDemoUsers();
