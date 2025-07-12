const { GoogleGenerativeAI } = require('@google/generative-ai');
const asyncHandler = require('express-async-handler');

// Initialize Google Generative AI
console.log('🔧 Initializing StackIt AI Service...');
console.log(`   Gemini API Key Status: ${process.env.GEMINI_API_KEY ? '✅ Present' : '❌ Missing'}`);
if (process.env.GEMINI_API_KEY) {
    const key = process.env.GEMINI_API_KEY;
    console.log(`   API Key Preview: ${key.substring(0, 10)}...${key.substring(key.length - 4)}`);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt for StackIt AI
const SYSTEM_PROMPT = `You are StackIt AI. Provide ultra-concise programming answers.

**Rules:**
- Maximum 150 words
- Start with the direct solution
- Only essential code snippets
- Use bullet points
- Be practical, not theoretical

**Format:**
**Solution:** [One-line answer]
**Code:** [Minimal example if needed]
**Tips:** [2-3 bullet points max]

No explanations. Just solutions.`;

class AIService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }

    // Generate AI answer for a question
    async generateAnswer(question, context = '') {
        try {
            console.log('AI Service: Starting answer generation');
            console.log('API Key present:', !!process.env.GEMINI_API_KEY);
            console.log('API Key length:', process.env.GEMINI_API_KEY?.length);

            const prompt = `${SYSTEM_PROMPT}

**Question:** ${question.title}
**Details:** ${question.description}
${context ? `**Additional Context:** ${context}` : ''}
${question.tags && question.tags.length > 0 ? `**Tags:** ${question.tags.map(tag => typeof tag === 'string' ? tag : tag.name).join(', ')}` : ''}

Provide a concise, practical answer in under 250 words. Focus on the solution, not theory.`;

            console.log('AI Service: Sending request to Gemini');
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log('AI Service: Received response from Gemini');
            console.log('Response length:', text.length);

            return {
                answer: text,
                generatedAt: new Date(),
                confidence: this.calculateConfidence(question, text)
            };
        } catch (error) {
            console.error('AI Service Error Details:', {
                message: error.message,
                status: error.status,
                statusText: error.statusText,
                stack: error.stack
            });
            throw new Error(`Failed to generate AI answer: ${error.message}`);
        }
    }

    // Calculate confidence score based on question complexity and answer quality
    calculateConfidence(question, answer) {
        let confidence = 0.7; // Base confidence

        // Increase confidence for detailed questions
        if (question.description && question.description.length > 100) {
            confidence += 0.1;
        }

        // Increase confidence for tagged questions
        if (question.tags && question.tags.length > 0) {
            confidence += 0.1;
        }

        // Increase confidence for concise but complete answers (50-300 chars)
        if (answer.length > 50 && answer.length < 300) {
            confidence += 0.1;
        }

        return Math.min(confidence, 0.95); // Cap at 95%
    }

    // Check if AI answer should be generated (rate limiting, etc.)
    shouldGenerateAnswer(question) {
        // Don't generate for very short questions
        if (!question.description || question.description.length < 20) {
            return false;
        }

        // Don't generate for questions without proper tags
        if (!question.tags || question.tags.length === 0) {
            return false;
        }

        return true;
    }
}

module.exports = new AIService();
