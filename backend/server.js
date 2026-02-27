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
    'https://mern-todo-gules.vercel.app'
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
  res.json({ status: "Server is running", timestamp: new Date().toISOString() });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected successfully");
    app.listen(process.env.PORT || 10000, () => {
      console.log("Server running on port", process.env.PORT || 10000);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });