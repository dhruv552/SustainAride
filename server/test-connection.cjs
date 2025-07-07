const connectDB = require('./db.cjs');
const User = require('./models/User.cjs');

async function testConnection() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Successfully connected to MongoDB');

    // Count users in the database
    const userCount = await User.countDocuments();
    console.log(`User collection exists with ${userCount} documents`);

    // List some users (without showing passwords)
    const users = await User.find({}, { password: 0 }).limit(5);
    if (users.length > 0) {
      console.log('Sample users in database:');
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email})`);
      });
    } else {
      console.log('No users found in the database');
    }

    console.log('MongoDB connection test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    process.exit(1);
  }
}

testConnection();