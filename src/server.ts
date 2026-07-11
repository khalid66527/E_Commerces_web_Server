import { MongoClient, ServerApiVersion } from 'mongodb';
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 5000;
const uri = process.env.MONGO_DB_URI;

if (!uri) {
  console.error("MONGO_DB_URI is not defined in .env file.");
  process.exit(1);
}

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Export database reference for route handlers to use
export const db = client.db('e-commerce');

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    
    // Ping database to verify connection
    await db.command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

run().catch(console.dir);
