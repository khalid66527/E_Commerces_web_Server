"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactsCollection = exports.pursessCollection = exports.cartCollection = exports.wishlistCollection = exports.usersCollection = exports.productsCollection = exports.db = void 0;
const mongodb_1 = require("mongodb");
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = process.env.PORT || 5000;
const uri = process.env.MONGO_DB_URI;
if (!uri) {
    console.error("MONGO_DB_URI is not defined in .env file.");
    process.exit(1);
}
// Create a MongoClient
const client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
// Export database reference for route handlers to use
exports.db = client.db(process.env.DB_NAME || 'e_commerce_web');
exports.productsCollection = exports.db.collection('products');
exports.usersCollection = exports.db.collection('user');
exports.wishlistCollection = exports.db.collection('wishlist');
exports.cartCollection = exports.db.collection('cart');
exports.pursessCollection = exports.db.collection('pursess');
exports.contactsCollection = exports.db.collection('contacts');
async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        // Ping database to verify connection
        await exports.db.command({ ping: 1 });
        console.log("Successfully connected to MongoDB!");
        if (process.env.VERCEL !== '1') {
            app_1.default.listen(port, () => {
                console.log(`Server is running on http://localhost:${port}`);
            });
        }
    }
    catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}
run().catch(console.dir);
