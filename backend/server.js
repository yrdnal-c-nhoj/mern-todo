if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { securityHeaders, sanitizeMongo, xssProtection, globalLimiter } = require("./middleware/security");

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(sanitizeMongo);
app.use(xssProtection);
app.use(globalLimiter);

// CORS configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'https://mern-todo-gules.vercel.app',
    'https://mern-todo-git-main-johns-projects-75897040.vercel.app',
    'https://mern-todo-mzvawp5in-johns-projects-75897040.vercel.app',
    'https://mern-todo-mkjxtubqo-johns-projects-75897040.vercel.app',
    'https://mern-todo-498zk07yp-johns-projects-75897040.vercel.app',
    'https://mern-todo-dwu9phmgq-johns-projects-75897040.vercel.app'
  ];
  
  if (process.env.NODE_ENV === 'production') {
    res.header('Access-Control-Allow-Origin', allowedOrigins.includes(origin) ? origin : 'https://mern-todo-gules.vercel.app');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '10kb' })); // Limit body size
app.use("/api/todos", require("./routes/todoRoutes"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "Server is running", 
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "MERN Todo API is running", 
    version: "1.0.0",
    endpoints: { 
      health: "/health", 
      todos: "/api/todos",
      docs: "https://github.com/yrdnal-c-nhoj/mern-todo"
    } 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      message: 'The provided ID is not valid'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Database connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log("✅ Database connected successfully");
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  const port = process.env.PORT || 10000;
  app.listen(port, () => {
    console.log("🚀 Server running successfully");
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Port: ${port}`);
    console.log(`🏥 Health check: http://localhost:${port}/health`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('📦 Database connection closed');
    process.exit(0);
  });
});

startServer();

module.exports = app;