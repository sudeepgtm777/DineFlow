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

['JWT_SECRET', 'MONGO_URI', 'FRONTEND_URL'].forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

const allowedOrigins = [
  ...(process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:3000', 'http://localhost:3001']),
  process.env.FRONTEND_URL,
].filter(Boolean);

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        const corsError = new Error('Not allowed by CORS') as Error & {
          status?: number;
        };
        corsError.status = 403;
        callback(corsError);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
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

app.use((req, res) => {
  res.status(404).json({ message: 'Not found', success: false });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    success: false,
  });
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

const start = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

start();
