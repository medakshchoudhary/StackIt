const mongoose = require('mongoose');
const User = require('./models/User');
const Question = require('./models/Question');
const Answer = require('./models/Answer');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Question.deleteMany({});
        await Answer.deleteMany({});

        // Create demo users
        const users = await User.create([
            {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'password123'
            },
            {
                username: 'jane_smith',
                email: 'jane@example.com',
                password: 'password123'
            },
            {
                username: 'admin_user',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin'
            },
            {
                username: 'demo_user',
                email: 'demo@example.com',
                password: 'password123'
            }
        ]);

        console.log('Demo users created:', users.map(u => ({ username: u.username, email: u.email })));

        // Create demo questions
        const questions = await Question.create([
            {
                title: 'How to implement JWT authentication in Node.js?',
                description: '<p>I am trying to implement JWT authentication in my Node.js application. Can someone guide me through the process?</p><p>What are the best practices for storing and managing JWT tokens?</p>',
                tags: ['Node.js', 'JWT', 'Authentication', 'Security'],
                author: users[0]._id
            },
            {
                title: 'React Hook Form vs Formik - Which is better?',
                description: '<p>I am building a React application and need to handle forms. I have heard about both React Hook Form and Formik.</p><p>Which one should I choose and why? What are the pros and cons of each?</p>',
                tags: ['React', 'Forms', 'React Hook Form', 'Formik'],
                author: users[1]._id
            },
            {
                title: 'MongoDB vs PostgreSQL for a new project',
                description: '<p>I am starting a new web application and need to choose between MongoDB and PostgreSQL for the database.</p><p>The app will have user profiles, posts, comments, and real-time features. Which database would be better suited for this use case?</p>',
                tags: ['MongoDB', 'PostgreSQL', 'Database', 'Architecture'],
                author: users[2]._id
            },
            {
                title: 'Best practices for API design in REST',
                description: '<p>What are the best practices for designing RESTful APIs? I want to make sure my API is well-structured and follows industry standards.</p><p>Should I use nested routes or keep everything flat? How should I handle versioning?</p>',
                tags: ['REST API', 'API Design', 'Best Practices', 'Backend'],
                author: users[3]._id
            },
            {
                title: 'How to handle state management in large React applications?',
                description: '<p>My React application is growing and state management is becoming complex. I am currently using useState and useContext but it feels messy.</p><p>Should I switch to Redux or are there other alternatives like Zustand or Recoil?</p>',
                tags: ['React', 'State Management', 'Redux', 'Zustand'],
                author: users[0]._id
            }
        ]);

        console.log('Demo questions created:', questions.length);

        // Create demo answers
        const answers = await Answer.create([
            {
                content: '<p>Here is a comprehensive guide to implementing JWT authentication in Node.js:</p><p>1. Install the necessary packages: <code>npm install jsonwebtoken bcryptjs</code></p><p>2. Create a user model with password hashing</p><p>3. Implement login endpoint that returns JWT token</p><p>4. Create middleware to verify JWT tokens</p><p>Best practices include using environment variables for secrets and implementing proper token expiration.</p>',
                author: users[1]._id,
                question: questions[0]._id
            },
            {
                content: '<p>I have used both and here is my comparison:</p><p><strong>React Hook Form:</strong></p><ul><li>Better performance (fewer re-renders)</li><li>Smaller bundle size</li><li>TypeScript support out of the box</li></ul><p><strong>Formik:</strong></p><ul><li>More mature ecosystem</li><li>Better documentation</li><li>More flexible validation</li></ul><p>For new projects, I recommend React Hook Form due to its performance benefits.</p>',
                author: users[2]._id,
                question: questions[1]._id
            },
            {
                content: '<p>For your use case, I would recommend <strong>PostgreSQL</strong> for the following reasons:</p><p>1. <strong>ACID compliance</strong> - Important for user data integrity</p><p>2. <strong>Relational structure</strong> - User profiles, posts, and comments have clear relationships</p><p>3. <strong>JSON support</strong> - PostgreSQL supports JSON columns for flexible data</p><p>4. <strong>Performance</strong> - Better for complex queries and joins</p><p>MongoDB is great for document-heavy applications, but your use case seems more relational.</p>',
                author: users[0]._id,
                question: questions[2]._id
            }
        ]);

        console.log('Demo answers created:', answers.length);

        // Update questions with answers
        await Question.findByIdAndUpdate(questions[0]._id, { 
            $push: { answers: answers[0]._id },
            acceptedAnswer: answers[0]._id
        });
        await Question.findByIdAndUpdate(questions[1]._id, { 
            $push: { answers: answers[1]._id }
        });
        await Question.findByIdAndUpdate(questions[2]._id, { 
            $push: { answers: answers[2]._id }
        });

        // Mark first answer as accepted
        await Answer.findByIdAndUpdate(answers[0]._id, { isAccepted: true });

        console.log('✅ Demo data seeded successfully!');
        console.log('\n📧 Demo Accounts:');
        console.log('Email: john@example.com | Password: password123 | Role: User');
        console.log('Email: jane@example.com | Password: password123 | Role: User');
        console.log('Email: admin@example.com | Password: password123 | Role: Admin');
        console.log('Email: demo@example.com | Password: password123 | Role: User');
        
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

const runSeed = async () => {
    await connectDB();
    await seedData();
    mongoose.connection.close();
};

runSeed();
