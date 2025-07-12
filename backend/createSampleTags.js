const mongoose = require('mongoose');
const Tag = require('./models/Tag');

// Connect to MongoDB
mongoose.connect('mongodb+srv://majxin:megtvnklsw@stack-it.yqgryg0.mongodb.net/?retryWrites=true&w=majority&appName=stack-it')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const createSampleTags = async () => {
  try {
    // Sample tags with descriptions
    const sampleTags = [
      { name: 'javascript', description: 'JavaScript programming language', isApproved: true },
      { name: 'react', description: 'React JavaScript library', isApproved: true },
      { name: 'nodejs', description: 'Node.js runtime environment', isApproved: true },
      { name: 'python', description: 'Python programming language', isApproved: true },
      { name: 'mongodb', description: 'MongoDB database', isApproved: true },
      { name: 'express', description: 'Express.js web framework', isApproved: true },
      { name: 'html', description: 'HTML markup language', isApproved: true },
      { name: 'css', description: 'CSS styling language', isApproved: true },
      { name: 'typescript', description: 'TypeScript programming language', isApproved: true },
      { name: 'git', description: 'Git version control system', isApproved: true }
    ];

    for (const tagData of sampleTags) {
      const existingTag = await Tag.findOne({ name: tagData.name });
      if (!existingTag) {
        await Tag.create(tagData);
        console.log(`Created tag: ${tagData.name}`);
      } else {
        console.log(`Tag already exists: ${tagData.name}`);
      }
    }

    console.log('Sample tags created successfully');
  } catch (error) {
    console.error('Error creating sample tags:', error);
  } finally {
    process.exit(0);
  }
};

createSampleTags();
