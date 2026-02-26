require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
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
    app.listen(process.env.PORT || 5001, () => {
      console.log("Server running on port", process.env.PORT || 5001);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
