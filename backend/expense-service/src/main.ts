import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import expensesRoutes from './controllers/expenses.controller';
import categoriesRoutes from './controllers/categories.controller';
import remittancesRoutes from './controllers/remittances.controller';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3002;

// Database connection
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.connect()
  .then(() => console.log('✅ Expense Service connected to PostgreSQL'))
  .catch(err => console.error('❌ Database connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    service: 'expense-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1/expenses', expensesRoutes);
app.use('/api/v1/expense-categories', categoriesRoutes);
app.use('/api/v1/remittances', remittancesRoutes);

// Root
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'CRP Expense Management Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      expenses: '/api/v1/expenses',
      categories: '/api/v1/expense-categories',
      remittances: '/api/v1/remittances',
    },
  });
});

// Error handling
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Expense Service listening on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  pool.end();
  process.exit(0);
});
