// Server entry point - triggered restart
require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

console.log('--- Server Starting ---');
console.log('PORT:', process.env.PORT);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('-----------------------');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, 'http://localhost:8081', 'http://localhost:5185', 'http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ 
  origin: [process.env.CLIENT_URL, 'http://localhost:8081', 'http://localhost:5185', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Global Middlewares
const { generalLimiter } = require('./middleware/rateLimiter');
const auditLogger = require('./middleware/auditLogger');
app.use(generalLimiter);
app.use(auditLogger);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to our router
app.set('io', io);

// Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const chatRoutes = require('./routes/chatRoutes');
const plaidRoutes = require('./routes/plaidRoutes');
const gstRoutes = require('./routes/gstRoutes');
const auditRoutes = require('./routes/auditRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/plaid', plaidRoutes);
app.use('/api/gst', gstRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reports', reportRoutes);

// Base route for health check
app.get('/', (req, res) => {
  res.send('AI CFO Copilot API is running...');
});

// Initialize Cron Jobs
const initCronJobs = require('./jobs/cronJobs');
initCronJobs();

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
