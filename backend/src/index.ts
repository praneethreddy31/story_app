import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import sessionRoutes from './routes/sessions';
import messageRoutes from './routes/messages';
import conversationRoutes from './routes/conversations';
import aiProxyRoutes from './routes/aiProxy';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

console.log("--- SERVER BOOTING UP: VERSION WITH AI PROXY DEBUG LOGS ---");

const app = express();
const server = createServer(app);

// Get the live frontend URL from environment variables
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: frontendUrl,
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

// --- CORRECT MIDDLEWARE ORDER ---

// 1. Core Middleware (Security, CORS, Logging, Body Parsers)
app.use(helmet());
app.use(cors({
  origin: frontendUrl,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// 2. Health check endpoint (can be before routes)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// 3. API Routes (Your application's logic)
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/ai', aiProxyRoutes); // <-- The AI route is now here with the others

console.log("--- AI PROXY ROUTE has been successfully registered. ---");

// 4. Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  // ... (rest of your socket logic)
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 5. Final "Catch-All" Error Handling Middleware (MUST BE LAST)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { app, io };