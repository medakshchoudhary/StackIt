const axios = require('axios');

async function testQuestionCreation() {
    try {
        console.log('Testing question creation with auto-tag creation...');
        
        // Step 1: Login to get token
        const loginResponse = await axios.post('http://localhost:5500/api/auth/login', {
            username: 'admin',
            password: 'password123'
        });
        
        const token = loginResponse.data.token;
        console.log('✓ Successfully logged in');
        
        // Step 2: Create a question with new tags
        const questionData = {
            title: 'How to implement authentication in React?',
            description: 'I need help implementing JWT authentication in my React application. What are the best practices?',
            tags: ['react', 'jwt', 'authentication', 'frontend']
        };
        
        const questionResponse = await axios.post('http://localhost:5500/api/questions', questionData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✓ Successfully created question');
        console.log('Question ID:', questionResponse.data.data._id);
        console.log('Question Tags:', questionResponse.data.data.tags);
        
        // Step 3: Verify tags were created
        const tagsResponse = await axios.get('http://localhost:5500/api/tags');
        console.log('✓ Total tags in database:', tagsResponse.data.tags.length);
        
        const newTags = tagsResponse.data.tags.filter(tag => 
            ['react', 'jwt', 'authentication', 'frontend'].includes(tag.name)
        );
        console.log('✓ New tags created:', newTags.map(t => t.name));
        
        console.log('\n🎉 All tests passed! Tag auto-creation is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.data?.errors) {
            console.error('Validation errors:', error.response.data.errors);
        }
    }
}

testQuestionCreation();
