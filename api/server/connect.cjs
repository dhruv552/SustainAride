const { MongoClient } = require("mongodb");
const path = require("path");
// Use path.resolve to get the absolute path to config.env
require("dotenv").config({ path: path.resolve(__dirname, "config.env") });

async function main() {
    // Check if connection string is available
    const uri = process.env.ATLAS_URI;
    if (!uri) {
        console.error("Error: ATLAS_URI is not defined in environment variables");
        process.exit(1);
    }

    console.log("Attempting to connect to MongoDB Atlas...");
    console.log("Connection string format check:", uri.startsWith("mongodb+srv://") ? "OK" : "INVALID");

    // Extract username from URI for diagnostic purposes
    const uriParts = uri.split('@')[0];
    const username = uriParts.split('mongodb+srv://')[1].split(':')[0];
    console.log("Username from connection string:", username);

    // Connection options with timeout settings
    const options = {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
    };

    // Create a new client and connect
    const client = new MongoClient(uri, options);

    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Successfully connected to MongoDB Atlas");

        // List databases
        const databasesList = await client.db().admin().listDatabases();
        console.log("Databases:");
        databasesList.databases.forEach(db => console.log(` - ${db.name}`));

        // List collections in the SustainAride database (or use a specific database name)
        const dbName = "SustainAride";
        const collections = await client.db(dbName).listCollections().toArray();
        console.log(`\nCollections in '${dbName}' database:`);
        if (collections.length > 0) {
            collections.forEach(collection => console.log(` - ${collection.name}`));
        } else {
            console.log(` No collections found in '${dbName}' database`);
        }

    } catch (err) {
        console.error("MongoDB connection error:", err);

        // More detailed error diagnosis
        if (err.name === 'MongoServerError') {
            if (err.code === 8000 || err.message.includes('auth')) {
                console.error("\nAuthentication Error: Your username or password appears to be incorrect.");
                console.error("Please check your MongoDB Atlas credentials and ensure they are correct.");
                console.error("You may need to reset your password in MongoDB Atlas dashboard.");
            } else if (err.code === 13 || err.message.includes('not authorized')) {
                console.error("\nAuthorization Error: The user doesn't have permission to access the database.");
                console.error("Make sure your user has the appropriate roles assigned in MongoDB Atlas.");
            } else if (err.message.includes('timed out')) {
                console.error("\nTimeout Error: The connection timed out.");
                console.error("This could be due to network issues or incorrect cluster name.");
                console.error("Verify your network connection and cluster name in the connection string.");
            }
        } else if (err.name === 'MongoParseError') {
            console.error("\nConnection String Error: The MongoDB connection string is invalid.");
            console.error("Please check the format of your connection string.");
        } else {
            console.error("\nUnknown Error: Please check your network and MongoDB Atlas status.");
        }
    } finally {
        // Close the connection
        await client.close();
        console.log("MongoDB connection closed");
    }
}

// Run the main function
main().catch(console.error);