import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from './App.module.css';
import '../styles/variables.css';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD 
    ? 'https://nasapod-1.onrender.com'
    : 'http://localhost:5001');
  
axios.defaults.withCredentials = false;
axios.defaults.timeout = 10000;

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch todos with error handling
  const fetchTodos = useCallback(async () => {
    if (!isOnline) {
      setError("You're offline. Please check your connection.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await axios.get("/api/todos");
      setTodos(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Failed to fetch todos: ${errorMessage}`);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Add todo with validation
  const handleAdd = async () => {
    const trimmedTodo = newTodo.trim();
    
    if (!trimmedTodo) {
      setError("Please enter a todo item");
      return;
    }
    
    if (trimmedTodo.length > 200) {
      setError("Todo must be less than 200 characters");
      return;
    }

    if (!isOnline) {
      setError("You're offline. Todo will be added when you're back online.");
      return;
    }

    const tempId = Date.now();
    const newTodoObj = { _id: tempId, text: trimmedTodo, completed: false };

    // Optimistic update
    setTodos((prev) => [...prev, newTodoObj]);
    setNewTodo("");
    setError("");

    try {
      const res = await axios.post("/api/todos", { text: trimmedTodo });
      setTodos((prev) =>
        prev.map((todo) => (todo._id === tempId ? res.data.data : todo))
      );
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Failed to add todo: ${errorMessage}`);
      // Rollback optimistic update
      setTodos((prev) => prev.filter((todo) => todo._id !== tempId));
    }
  };

  // Delete todo with confirmation
  const handleDelete = async (id) => {
    if (!isOnline) {
      setError("You're offline. Todo will be deleted when you're back online.");
      return;
    }

    const originalTodos = [...todos];
    const todoToDelete = todos.find(todo => todo._id === id);
    
    // Optimistic update
    setTodos((prev) => prev.filter((todo) => todo._id !== id));
    setError("");

    try {
      await axios.delete(`/api/todos/${id}`);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Failed to delete todo: ${errorMessage}`);
      // Rollback optimistic update
      setTodos(originalTodos);
    }
  };

  // Clear error message
  const clearError = () => setError("");

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>John's Todo List</h1>
          <div className={styles.subtitle}>
            <div className={`${styles.statusIndicator} ${isOnline ? styles.online : styles.offline}`}></div>
            <span className={`${styles.statusText} ${isOnline ? styles.online : styles.offline}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </header>

        {/* Add Todo Form */}
        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
          <div className={styles.formRow}>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Enter a new todo"
              maxLength={200}
              className={styles.input}
              disabled={!isOnline}
            />
            <button
              type="submit"
              disabled={!isOnline || loading}
              className={styles.button}
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>

        {/* Status Messages */}
        {loading && (
          <div className={`${styles.alert} ${styles.info}`}>
            <span className={styles.alertContent}>Loading todos...</span>
          </div>
        )}
        
        {error && (
          <div className={`${styles.alert} ${styles.error}`}>
            <span className={styles.alertContent}>{error}</span>
            <button
              onClick={clearError}
              className={styles.alertClose}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Todo List */}
        {!loading && (!Array.isArray(todos) || todos.length === 0) ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📝</div>
            <p className={styles.emptyStateText}>No todos yet! Add one above to get started.</p>
          </div>
        ) : (
          <div className={styles.todoList}>
            {todos.map((todo) => (
              <div
                key={todo._id}
                className={styles.todoItem}
              >
                <p className={styles.todoText}>{todo.text}</p>
                <button
                  onClick={() => handleDelete(todo._id)}
                  disabled={!isOnline}
                  className={styles.deleteButton}
                  aria-label={`Delete todo: ${todo.text}`}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className={styles.footer}>
          <p className={styles.footerText}>
            {todos.length} {todos.length === 1 ? 'todo' : 'todos'} • Built with MERN stack
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
