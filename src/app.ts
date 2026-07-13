import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { ObjectId } from 'mongodb';
import { verifyJWT, verifyAdmin, AuthRequest } from './middleware/auth';

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

// Post a product (Admin only)
app.post('/api/products', verifyJWT, verifyAdmin, async (req: AuthRequest, res: Response) => {
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

// Get all products (Public)
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

// Get a single product by ID (Public)
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

// Delete a product (Admin only)
app.delete('/api/products/:id', verifyJWT, verifyAdmin, async (req: AuthRequest, res: Response) => {
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

// Get all users (Admin only)
app.get('/api/users', verifyJWT, verifyAdmin, async (req: AuthRequest, res: Response) => {
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

// Update user role (Admin only)
app.patch('/api/users/:id', verifyJWT, verifyAdmin, async (req: AuthRequest, res: Response) => {
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

// Delete a user (Admin only)
app.delete('/api/users/:id', verifyJWT, verifyAdmin, async (req: AuthRequest, res: Response) => {
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

// Add to wishlist (JWT verified)
app.post('/api/wishlist', verifyJWT, async (req: AuthRequest, res: Response) => {
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

    // Verify requesting email matches JWT
    if (req.user?.email !== email) {
      res.status(403).json({ success: false, message: 'Forbidden access: Email mismatch' });
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

// Get wishlist items by user email (JWT verified)
app.get('/api/wishlist', verifyJWT, async (req: AuthRequest, res: Response) => {
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

    // Verify requesting email matches JWT
    if (req.user?.email !== email) {
      res.status(403).json({ success: false, message: 'Forbidden access: Email mismatch' });
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

// Delete from wishlist (JWT verified)
app.delete('/api/wishlist/:id', verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { wishlistCollection } = await import('./server');
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Wishlist Item ID is required' });
      return;
    }

    // First find the item to check ownership
    const item = await wishlistCollection.findOne({ _id: new ObjectId(id as string) });
    if (!item) {
      res.status(404).json({ success: false, message: 'Wishlist item not found' });
      return;
    }

    // Verify ownership
    if (req.user?.email !== item.email) {
      res.status(403).json({ success: false, message: 'Forbidden access: Ownership mismatch' });
      return;
    }

    const result = await wishlistCollection.deleteOne({ _id: new ObjectId(id as string) });
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

// Add item to cart (JWT verified)
app.post('/api/cart', verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { cartCollection } = await import('./server');
    const { email, userName, userId, productId, product, quantity } = req.body;

    if (!email || !productId) {
      res.status(400).json({
        success: false,
        message: 'Email and Product ID are required',
      });
      return;
    }

    // Verify email matches JWT
    if (req.user?.email !== email) {
      res.status(403).json({ success: false, message: 'Forbidden access: Email mismatch' });
      return;
    }

    const qty = Number(quantity) || 1;

    // Check if item already exists in user's cart
    const existing = await cartCollection.findOne({ email, productId });
    if (existing) {
      const newQty = (existing.quantity || 1) + qty;
      await cartCollection.updateOne(
        { _id: existing._id },
        { $set: { quantity: newQty } }
      );
      res.status(200).json({
        success: true,
        message: 'Cart item quantity updated',
        data: { ...existing, quantity: newQty }
      });
      return;
    }

    const newCartItem = {
      email,
      userName: userName || '',
      userId: userId || '',
      productId,
      title: product.title,
      brand: product.brand,
      price: Number(product.price) || 0,
      imageUrl: product.imageUrl,
      category: product.category,
      description: product.description || '',
      quantity: qty,
      addedAt: new Date().toISOString()
    };

    const result = await cartCollection.insertOne(newCartItem);
    res.status(201).json({
      success: true,
      message: 'Product added to cart successfully',
      data: { _id: result.insertedId, ...newCartItem }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to add to cart',
    });
  }
});

// Get user's cart items (JWT verified)
app.get('/api/cart', verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { cartCollection } = await import('./server');
    const { email } = req.query;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'User email is required',
      });
      return;
    }

    // Verify email matches JWT
    if (req.user?.email !== email) {
      res.status(403).json({ success: false, message: 'Forbidden access: Email mismatch' });
      return;
    }

    const items = await cartCollection.find({ email: email as string }).toArray();
    res.status(200).json({
      success: true,
      message: 'Cart fetched successfully',
      data: items,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch cart',
    });
  }
});

// Update cart item quantity (JWT verified)
app.patch('/api/cart/:id', verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { cartCollection } = await import('./server');
    const { id } = req.params;
    const { quantity } = req.body;

    if (!id) {
      res.status(400).json({ success: false, message: 'Cart Item ID is required' });
      return;
    }

    if (quantity === undefined || isNaN(Number(quantity))) {
      res.status(400).json({ success: false, message: 'Valid quantity is required' });
      return;
    }

    // Find cart item first to verify ownership
    const cartItem = await cartCollection.findOne({ _id: new ObjectId(id as string) });
    if (!cartItem) {
      res.status(404).json({ success: false, message: 'Cart item not found' });
      return;
    }

    // Verify email matches JWT
    if (req.user?.email !== cartItem.email) {
      res.status(403).json({ success: false, message: 'Forbidden access: Ownership mismatch' });
      return;
    }

    await cartCollection.updateOne(
      { _id: new ObjectId(id as string) },
      { $set: { quantity: Number(quantity) } }
    );

    res.status(200).json({
      success: true,
      message: 'Cart item quantity updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update quantity',
    });
  }
});

// Delete item from cart (JWT verified)
app.delete('/api/cart/:id', verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { cartCollection } = await import('./server');
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, message: 'Cart Item ID is required' });
      return;
    }

    // Find cart item first to verify ownership
    const cartItem = await cartCollection.findOne({ _id: new ObjectId(id as string) });
    if (!cartItem) {
      res.status(404).json({ success: false, message: 'Cart item not found' });
      return;
    }

    // Verify email matches JWT
    if (req.user?.email !== cartItem.email) {
      res.status(403).json({ success: false, message: 'Forbidden access: Ownership mismatch' });
      return;
    }

    await cartCollection.deleteOne({ _id: new ObjectId(id as string) });
    res.status(200).json({
      success: true,
      message: 'Cart item removed successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to remove cart item',
    });
  }
});

// Get purchase history by user email (JWT verified)
app.get('/api/purchase-history', verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { pursessCollection } = await import('./server');
    const { email } = req.query;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'User email is required',
      });
      return;
    }

    // Verify email matches JWT
    if (req.user?.email !== email) {
      res.status(403).json({ success: false, message: 'Forbidden access: Email mismatch' });
      return;
    }

    const purchases = await pursessCollection.find({ 'user.email': email as string }).toArray();
    res.status(200).json({
      success: true,
      message: 'Purchase history fetched successfully',
      data: purchases,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch purchase history',
    });
  }
});

// Create contact message (JWT verified)
app.post('/api/contacts', verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { contactsCollection } = await import('./server');
    const { name, email, subject, message } = req.body;

    if (!email || !message) {
      res.status(400).json({ success: false, message: 'Email and Message are required' });
      return;
    }

    // Verify email matches JWT
    if (req.user?.email !== email) {
      res.status(403).json({ success: false, message: 'Forbidden access: Email mismatch' });
      return;
    }

    const contactItem = {
      name: name || '',
      email,
      subject: subject || 'No Subject',
      message,
      reply: '',
      repliedAt: null,
      createdAt: new Date().toISOString()
    };

    const result = await contactsCollection.insertOne(contactItem);
    res.status(201).json({
      success: true,
      message: 'Contact message submitted successfully',
      data: { _id: result.insertedId, ...contactItem }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to submit contact message' });
  }
});

// Get all contact messages for admin (Admin only)
app.get('/api/contacts', verifyJWT, verifyAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { contactsCollection } = await import('./server');
    const contacts = await contactsCollection.find({}).toArray();
    res.status(200).json({
      success: true,
      message: 'Contact messages fetched successfully',
      data: contacts
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch contact messages' });
  }
});

// Get contact messages by user email (JWT verified)
app.get('/api/contacts/user', verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { contactsCollection } = await import('./server');
    const { email } = req.query;

    if (!email) {
      res.status(400).json({ success: false, message: 'User email is required' });
      return;
    }

    // Verify email matches JWT
    if (req.user?.email !== email) {
      res.status(403).json({ success: false, message: 'Forbidden access: Email mismatch' });
      return;
    }

    const contacts = await contactsCollection.find({ email: email as string }).toArray();
    res.status(200).json({
      success: true,
      message: 'User contact messages fetched successfully',
      data: contacts
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch user contact messages' });
  }
});

// Reply to contact message (Admin only)
app.patch('/api/contacts/:id/reply', verifyJWT, verifyAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { contactsCollection } = await import('./server');
    const { id } = req.params;
    const { reply } = req.body;

    if (!id) {
      res.status(400).json({ success: false, message: 'Contact message ID is required' });
      return;
    }

    const result = await contactsCollection.updateOne(
      { _id: new ObjectId(id as string) },
      {
        $set: {
          reply: reply || '',
          repliedAt: new Date().toISOString()
        }
      }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ success: false, message: 'Contact message not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Reply submitted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to submit reply' });
  }
});

// Get all purchases for admin (Admin only)
app.get('/api/admin/purchases', verifyJWT, verifyAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { pursessCollection } = await import('./server');
    const purchases = await pursessCollection.find({}).toArray();
    res.status(200).json({
      success: true,
      message: 'All purchases fetched successfully',
      data: purchases
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch all purchases'
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
