// @ts-nocheck
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './utils/db';
import userRoute from './routes/user.route';
import menuItemRoute from './routes/menuItem.route';
import orderRoute from './routes/order.route';
import tableRoute from './routes/table.route';
import billRoute from './routes/bill.route';
import roomRoute from './routes/room.route';
import posRoute from './routes/pos.route';
import bookingRoute from './routes/booking.route';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4000',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4000',
        'http://localhost:5173',
        'https://restro-erp.onrender.com',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.locals.io = io;

// Routes
app.use('/api/v1/user', userRoute);
app.use('/api/v1/menuitem', menuItemRoute);
app.use('/api/v1/order', orderRoute);
app.use('/api/v1/table', tableRoute);
app.use('/api/v1/bill', billRoute);
app.use('/api/v1/room', roomRoute);
app.use('/api/v1/pos', posRoute);
app.use('/api/v1/roombooking', bookingRoute);

app.get('/', (req, res) => {
  res.json({ message: 'Restaurant API running', success: true });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
});
