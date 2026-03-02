import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD 
    ? 'https://nasapod-1.onrender.com'
    : 'http://localhost:5001');
  
axios.defaults.withCredentials = false;
axios.defaults.timeout = 10000; // 10 second timeout

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
    <div className="flex justify-center items-center bg-blue-50 px-4 py-8 min-h-screen">
      <div className="bg-white shadow-lg p-6 sm:p-8 rounded-xl w-full max-w-xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 font-semibold text-slate-900 text-2xl sm:text-3xl text-center">
            John's Todo List
          </h1>
          <div className="flex justify-center items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Add Todo Form */}
        <div className="flex sm:flex-row flex-col gap-3 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Enter a new todo"
            maxLength={200}
            className="flex-1 bg-slate-50 shadow-sm px-3 py-2 border border-slate-300 focus:border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            disabled={!isOnline}
          />
          <button
            onClick={handleAdd}
            disabled={!isOnline || loading}
            className="inline-flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 shadow-sm px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium text-white text-sm sm:text-base disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="bg-blue-50 mb-3 p-3 border border-blue-200 rounded-lg">
            <p className="text-blue-600 text-sm">Loading todos...</p>
          </div>
        )}
        
        {error && (
          <div className="flex justify-between items-center bg-red-50 mb-3 p-3 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Todo List */}
        {!loading && (!Array.isArray(todos) || todos.length === 0) ? (
          <div className="py-8 text-center">
            <div className="mb-4 text-4xl">📝</div>
            <p className="text-slate-500 text-sm">No todos yet! Add one above to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo._id}
                className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 px-3 py-2 border border-slate-200 rounded-lg transition-colors"
              >
                <p className="flex-1 mr-3 text-slate-800 break-words">{todo.text}</p>
                <button
                  onClick={() => handleDelete(todo._id)}
                  disabled={!isOnline}
                  className="inline-flex justify-center items-center bg-red-50 hover:bg-red-100 disabled:opacity-60 px-2 py-1 border border-red-200 rounded-md font-medium text-red-600 text-xs transition-colors disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-slate-200 border-t">
          <p className="text-slate-400 text-xs text-center">
            {todos.length} {todos.length === 1 ? 'todo' : 'todos'} • Built with MERN stack
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
