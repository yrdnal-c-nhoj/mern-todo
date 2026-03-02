const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");
const { validateTodo, validateMongoId } = require("../middleware/validation");

// Rate limiting
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(apiLimiter);

// GET all todos
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch todos",
      message: error.message 
    });
  }
});

// POST a new todo
router.post("/", validateTodo, async (req, res) => {
  try {
    const newTodo = new Todo({ text: req.body.text });
    await newTodo.save();
    res.status(201).json({
      success: true,
      message: "Todo created successfully",
      data: newTodo
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Failed to create todo",
      message: error.message 
    });
  }
});

// DELETE a todo by ID
router.delete("/:id", validateMongoId, async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) {
      return res.status(404).json({ 
        success: false,
        error: "Todo not found" 
      });
    }
    res.json({
      success: true,
      message: "Todo deleted successfully",
      data: deletedTodo
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Failed to delete todo",
      message: error.message 
    });
  }
});

module.exports = router;
