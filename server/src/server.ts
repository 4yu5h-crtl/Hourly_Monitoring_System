import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import { testConnection } from './db/connection.js';
import shiftsRouter from './routes/shifts.js';
import entriesRouter from './routes/entries.js';
import summaryRouter from './routes/summary.js';
import opcRouter from './routes/opcRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/shifts', shiftsRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/summary', summaryRouter);
app.use('/api/opc', opcRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((err: any, _req: Request, res: Response) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
async function startServer() {
  try {
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to database. Please check your connection settings.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
