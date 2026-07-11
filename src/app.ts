import express, { Application, Request, Response } from 'express';
import cors from 'cors';

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

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API Route Not Found',
  });
});

export default app;
