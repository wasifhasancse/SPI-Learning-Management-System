import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const clientUrl = process.env.CLIENT_URL;

if (!clientUrl) {
  throw new Error('CLIENT_URL must be defined in backend environment variables');
}

import courseRoutes from './routes/courseRoutes';
import nestedLectureRoutes from './routes/lectureRoutes';
import directLectureRoutes from './routes/directLectureRoutes';

const app = express();

// CORS Configuration
app.use(cors({
  origin: [clientUrl, 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'SPI LMS Backend API is running' });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'SPI LMS Backend API (TypeScript)',
    database: 'Neon PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes (MVC Pattern)
app.use('/api/courses', courseRoutes);
app.use('/api/courses/:courseId/lectures', nestedLectureRoutes);
app.use('/api/lectures', directLectureRoutes);

// 404 Not Found Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;

