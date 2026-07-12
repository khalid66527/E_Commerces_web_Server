import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { ObjectId } from 'mongodb';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the E-Commerce Server API',
  });
});

// Post a product
app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const { productsCollection } = await import('./server');
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create product',
    });
  }
});

// Get all products
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { productsCollection } = await import('./server');
    const products = await productsCollection.find({}).toArray();
    res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch products',
    });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { productsCollection } = await import('./server');
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Product ID is required' });
      return;
    }
    const result = await productsCollection.deleteOne({ _id: new ObjectId(id as string) });
    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to delete product',
    });
  }
});

// Get all users
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const { usersCollection } = await import('./server');
    const users = await usersCollection.find({}).toArray();
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch users',
    });
  }
});

// Update user role
app.patch('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const { usersCollection } = await import('./server');
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
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id as string) },
      { $set: { role } }
    );
    if (result.matchedCount === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update user role',
    });
  }
});

// Delete a user
app.delete('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const { usersCollection } = await import('./server');
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id as string) });
    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to delete user',
    });
  }
});

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API Route Not Found',
  });
});

export default app;
