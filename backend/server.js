if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

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
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use("/api/todos", require("./routes/todoRoutes"));

app.get("/health", (req, res) => {
  res.json({ status: "Server is running", env: process.env.NODE_ENV });
});

app.get("/", (req, res) => {
  res.json({ message: "MERN Todo API is running", endpoints: { health: "/health", todos: "/api/todos" } });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Database connected successfully to:", process.env.MONGO_URI);
    const port = process.env.PORT || 10000;
    app.listen(port, () => {
      console.log("🚀 Server running on port", port);
      console.log("📡 Health check: https://mern-todo-b3fe.onrender.com/health");
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  });