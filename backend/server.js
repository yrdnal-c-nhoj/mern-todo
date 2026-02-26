require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-app.vercel.app', 'https://your-custom-domain.com']
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Router placeholder
app.use("/api/todos", require("./routes/todoRoutes"));

// connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5001, () => {
      console.log("Server running on port", process.env.PORT || 5001);
    });
  })
  .catch((err) => console.error(err));
