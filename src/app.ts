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

// Get a single product by ID
app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { productsCollection } = await import('./server');
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Product ID is required' });
      return;
    }
    const product = await productsCollection.findOne({ _id: new ObjectId(id as string) });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Product fetched successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch product',
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

// Add to wishlist
app.post('/api/wishlist', async (req: Request, res: Response) => {
  try {
    const { wishlistCollection } = await import('./server');
    const { email, productId, product } = req.body;
    
    if (!email || !productId) {
      res.status(400).json({
        success: false,
        message: 'Email and Product ID are required',
      });
      return;
    }

    // Check if already exists in wishlist for this user
    const existing = await wishlistCollection.findOne({ email, productId });
    if (existing) {
      res.status(200).json({
        success: true,
        message: 'Product is already in wishlist',
        data: existing,
      });
      return;
    }

    const newWishlistItem = {
      email,
      productId,
      title: product.title,
      brand: product.brand,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      description: product.description,
      specifications: product.specifications || {},
      addedAt: new Date().toISOString()
    };

    const result = await wishlistCollection.insertOne(newWishlistItem);
    res.status(201).json({
      success: true,
      message: 'Product added to wishlist successfully',
      data: { _id: result.insertedId, ...newWishlistItem },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to add to wishlist',
    });
  }
});

// Get wishlist items by user email
app.get('/api/wishlist', async (req: Request, res: Response) => {
  try {
    const { wishlistCollection } = await import('./server');
    const { email } = req.query;
    
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'User email is required',
      });
      return;
    }

    const items = await wishlistCollection.find({ email: email as string }).toArray();
    res.status(200).json({
      success: true,
      message: 'Wishlist fetched successfully',
      data: items,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch wishlist',
    });
  }
});

// Delete from wishlist
app.delete('/api/wishlist/:id', async (req: Request, res: Response) => {
  try {
    const { wishlistCollection } = await import('./server');
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Wishlist Item ID is required' });
      return;
    }
    const result = await wishlistCollection.deleteOne({ _id: new ObjectId(id as string) });
    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: 'Wishlist item not found' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to delete wishlist item',
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
