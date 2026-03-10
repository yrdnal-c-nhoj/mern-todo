import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://nasapod-1.onrender.com' : 'http://localhost:5001');
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
      // Rollback
      setTodos((prev) => prev.filter((todo) => todo._id !== tempId));
    }
  };

  // Delete todo with confirmation
  const handleDelete = async (id) => {
    if (!isOnline) {
      setError("You're offline. Deletion will sync when online.");
      return;
    }

    const originalTodos = [...todos];
    // Optimistic update
    setTodos((prev) => prev.filter((todo) => todo._id !== id));
    setError("");

    try {
      await axios.delete(`/api/todos/${id}`);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Failed to delete todo: ${errorMessage}`);
      // Rollback
      setTodos(originalTodos);
    }
  };

  const clearError = () => setError("");

  return (
    <div className="page-container gradient-bg">
      <div className="content-container">
        <div className="w-full max-w-lg mx-auto card">
          {/* Header */}
          <div className="card-header">
            <h1 className="text-3xl text-center text-display text-slate-800 sm:text-4xl">
              John's Todo List
            </h1>
            <div className="flex items-center justify-center gap-2.5 mt-3 text-sm">
              <div
                className={`w-3 h-3 rounded-full ring-2 ring-offset-2 transition-all duration-300 ${
                  isOnline
                    ? 'bg-green-500 ring-green-200 animate-pulse'
                    : 'bg-red-500 ring-red-200'
                }`}
              />
              <span
                className={`font-medium text-label ${
                  isOnline ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {isOnline ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Input + Button */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="What needs to be done?"
                maxLength={200}
                disabled={!isOnline || loading}
                className="flex-1 form-input"
              />
              <button
                onClick={handleAdd}
                disabled={!isOnline || loading || !newTodo.trim()}
                className="form-button min-w-[100px]"
              >
                {loading ? (
                  <span className="animate-pulse">ADDING…</span>
                ) : (
                  "ADD TASK"
                )}
              </button>
            </div>
          </div>

          {/* Messages */}
          {loading && (
            <div className="flex items-center justify-center gap-2 p-4 mx-6 mt-4 alert-info">
              <span className="loading-spinner" />
              <span>Loading tasks...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between p-4 mx-6 mt-4 alert-error">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="px-2 text-xl font-bold leading-none text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}

          {/* Todo List */}
          <div className="card-body">
            {todos.length === 0 && !loading ? (
              <div className="py-12 text-center text-slate-400">
                <div className="mb-4 text-6xl opacity-70">📋</div>
                <p className="text-lg font-medium text-display">Your list is empty</p>
                <p className="mt-1 text-sm text-label">Add a task above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div
                    key={todo._id}
                    className={`group flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-200
                      ${todo.completed
                        ? 'bg-green-50/60 border-green-100'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300'}`}
                  >
                    <p
                      className={`flex-1 mr-4 font-medium break-words text-label ${
                        todo.completed ? 'line-through text-slate-500' : 'text-slate-800'
                      }`}
                    >
                      {todo.text}
                    </p>
                    <button
                      onClick={() => handleDelete(todo._id)}
                      disabled={!isOnline}
                      className="btn btn-danger"
                    >
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-5 text-xs text-center border-t bg-slate-50/70 border-slate-100 text-slate-500 text-label">
            {todos.length} {todos.length === 1 ? 'task' : 'tasks'} • John's MERN To-Do App
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;