"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongodb_1 = require("mongodb");
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the E-Commerce Server API',
    });
});
// Post a product
app.post('/api/products', async (req, res) => {
    try {
        const { productsCollection } = await Promise.resolve().then(() => __importStar(require('./server')));
        const product = req.body;
        if (!product || Object.keys(product).length === 0) {
            res.status(400).json({
                success: false,
                message: 'Product data is required',
            });
            return;
        }
        const result = await productsCollection.insertOne(product);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error?.message || 'Failed to create product',
        });
    }
});
// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const { productsCollection } = await Promise.resolve().then(() => __importStar(require('./server')));
        const products = await productsCollection.find({}).toArray();
        res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: products,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error?.message || 'Failed to fetch products',
        });
    }
});
// Delete a product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { productsCollection } = await Promise.resolve().then(() => __importStar(require('./server')));
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: 'Product ID is required' });
            return;
        }
        const result = await productsCollection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        if (result.deletedCount === 0) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error?.message || 'Failed to delete product',
        });
    }
});
// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const { usersCollection } = await Promise.resolve().then(() => __importStar(require('./server')));
        const users = await usersCollection.find({}).toArray();
        res.status(200).json({
            success: true,
            message: 'Users fetched successfully',
            data: users,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error?.message || 'Failed to fetch users',
        });
    }
});
// Update user role
app.patch('/api/users/:id', async (req, res) => {
    try {
        const { usersCollection } = await Promise.resolve().then(() => __importStar(require('./server')));
        const { id } = req.params;
        const { role } = req.body;
        if (!id) {
            res.status(400).json({ success: false, message: 'User ID is required' });
            return;
        }
        if (!role) {
            res.status(400).json({ success: false, message: 'Role is required' });
            return;
        }
        const result = await usersCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { role } });
        if (result.matchedCount === 0) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error?.message || 'Failed to update user role',
        });
    }
});
// Delete a user
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { usersCollection } = await Promise.resolve().then(() => __importStar(require('./server')));
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: 'User ID is required' });
            return;
        }
        const result = await usersCollection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        if (result.deletedCount === 0) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error?.message || 'Failed to delete user',
        });
    }
});
// 404 Route handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API Route Not Found',
    });
});
exports.default = app;
