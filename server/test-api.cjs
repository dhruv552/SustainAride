// Test file to verify registration API with MongoDB
const axios = require('axios');
const connectDB = require('./db.cjs');
const User = require('./models/User.cjs');
const { v4: uuid } = require('uuid'); // You may need to install this: npm install uuid

async function testRegistration() {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('Connected to MongoDB');

        // Create a unique test user
        const uniqueId = uuid().substring(0, 8);
        const testUser = {
            name: `Test User ${uniqueId}`,
            email: `testuser${uniqueId}@example.com`,
            password: 'Password123!',
            phone: '1234567890'
        };

        console.log(`Attempting to register test user: ${testUser.email}`);

        // Make registration API call
        const response = await axios.post('http://localhost:5000/api/auth/register', testUser);

        console.log('Registration successful!');
        console.log('API Response:', JSON.stringify(response.data, null, 2));

        // Verify the user was actually created in the database
        const createdUser = await User.findOne({ email: testUser.email });

        if (createdUser) {
            console.log(`✅ Test user found in MongoDB database with ID: ${createdUser._id}`);
            console.log('Registration process successfully connected to MongoDB');
        } else {
            console.log('❌ Failed to find test user in MongoDB after registration');
        }

        process.exit(0);
    } catch (error) {
        console.error('Registration test failed:');
        if (error.response) {
            // The server responded with a status code outside the 2xx range
            console.error(`Error status: ${error.response.status}`);
            console.error('Error response:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received. Is the server running?');
        } else {
            // Something else happened while setting up the request
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

testRegistration();