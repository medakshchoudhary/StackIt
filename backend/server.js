const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Security headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/questions', require('./routes/answers')); // Mount answers under questions
app.use('/api/answers', require('./routes/answers')); // Also mount under answers for direct access
app.use('/api/votes', require('./routes/votes'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai')); // AI routes

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5500;

// Function to check Gemini API connection
const checkGeminiConnection = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.log('⚠️  Gemini API: No API key found in environment variables');
        console.log('   Please add GEMINI_API_KEY to your .env file');
        console.log('   Get your key from: https://ai.google.dev');
        return;
    }

    if (apiKey === 'your_gemini_api_key_here') {
        console.log('⚠️  Gemini API: Default placeholder API key detected');
        console.log('   Please replace with your actual Gemini API key');
        console.log('   Get your key from: https://ai.google.dev');
        return;
    }

    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        // Test with a simple prompt
        const result = await model.generateContent('Say "Hello from StackIt AI"');
        const response = await result.response;
        const text = response.text();
        
        if (text) {
            console.log('✅ Gemini API: Connected successfully');
            console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
            console.log('   Model: gemini-2.0-flash');
            console.log('   Status: Ready for AI answers');
        }
    } catch (error) {
        console.log('❌ Gemini API: Connection failed');
        console.log(`   Error: ${error.message}`);
        console.log('   Please check your API key and internet connection');
        
        if (error.message.includes('API_KEY_INVALID')) {
            console.log('   The API key appears to be invalid');
            console.log('   Get a new key from: https://ai.google.dev');
        }
    }
};

app.listen(PORT, async () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log('📊 MongoDB Connected: ' + process.env.MONGO_URI.split('@')[1].split('/')[0]);
    console.log('');
    console.log('🧠 Checking Gemini AI Connection...');
    await checkGeminiConnection();
    console.log('');
    console.log('🎯 StackIt API is ready!');
    console.log(`   Frontend URL: http://localhost:5173`);
    console.log(`   Backend URL: http://localhost:${PORT}`);
    console.log(`   API Documentation: http://localhost:${PORT}/api`);
});