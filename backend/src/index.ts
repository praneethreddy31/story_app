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

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Get the frontend URL from environment variables for CORS
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200'; // CHANGED

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: frontendUrl, // CHANGED
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: frontendUrl, // CHANGED
  credentials: true
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join story room for real-time collaboration
  socket.on('join-story', (storyId: string) => {
    socket.join(`story-${storyId}`);
    console.log(`User ${socket.id} joined story ${storyId}`);
  });

  // Handle story updates
  socket.on('story-update', (data) => {
    socket.to(`story-${data.storyId}`).emit('story-updated', data);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(`story-${data.storyId}`).emit('user-typing', {
      userId: data.userId,
      name: data.name
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export { app, io };