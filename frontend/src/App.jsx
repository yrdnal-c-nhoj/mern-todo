import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

// Configure axios defaults - force correct production URL
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
axios.defaults.baseURL = isProduction ? 'https://mern-todo-o78t.onrender.com' : 'http://localhost:5001';
axios.defaults.withCredentials = false;
axios.defaults.timeout = 30000;

// Debug logging
console.log('🔧 Environment:', { isProduction, hostname: window.location.hostname });
console.log('🌐 Base URL:', axios.defaults.baseURL);

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
    setLoading(true);
    setError("");
    try {
      const url = "/api/todos";
      console.log('📡 Fetching from:', axios.defaults.baseURL + url);
      const res = await axios.get(url);
      console.log('✅ Fetch success:', res.data);
      setTodos(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      console.log('❌ Request URL:', err.config?.baseURL + err.config?.url);
      setError(err.response?.data?.message || "Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  }, []);

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
        <div className="mx-auto w-full max-w-lg card">
          {/* Header */}
          <div className="card-header">
            <h1 className="text-display text-slate-800 text-3xl sm:text-4xl text-center">
              John's Todo List
            </h1>
            <div className="flex justify-center items-center gap-2.5 mt-3 text-sm">
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
          <div className="p-6 border-slate-100 border-b">
            <div className="flex sm:flex-row flex-col gap-3">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="What needs to be done?"
                maxLength={200}
                disabled={!isOnline || loading}
                className="flex-1 bg-slate-50 disabled:opacity-60 shadow-sm px-4 py-3 border border-slate-200 focus:border-indigo-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-800 transition-all placeholder-slate-400"
              />
              <button
                onClick={handleAdd}
                disabled={!isOnline || loading || !newTodo.trim()}
                className="flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 shadow-md hover:shadow-lg px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 min-w-[100px] font-medium text-white text-xs transition-all duration-200 disabled:cursor-not-allowed"
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
            <div className="flex justify-center items-center gap-2 mx-6 mt-4 p-4 alert-info">
              <span className="loading-spinner" />
              <span>Loading tasks...</span>
            </div>
          )}

          {error && (
            <div className="flex justify-between items-center mx-6 mt-4 p-4 alert-error">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="px-2 font-bold text-red-500 hover:text-red-700 text-xl leading-none"
              >
                ×
              </button>
            </div>
          )}

          {/* Todo List */}
          <div className="card-body">
            {todos.length === 0 && !loading ? (
              <div className="py-12 text-slate-400 text-center">
                <div className="opacity-70 mb-4 text-6xl">📋</div>
                <p className="font-medium text-display text-lg">Your list is empty</p>
                <p className="mt-1 text-label text-sm">Add a task above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div
                    key={todo._id}
                    className={`group flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-200
                      ${todo.completed
                        ? 'bg-green-50/60 border-green-100 border'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 border hover:border-slate-300'}`}
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
          <div className="bg-slate-50/70 px-6 py-5 border-slate-100 border-t text-label text-slate-500 text-xs text-center">
            {todos.length} {todos.length === 1 ? 'task' : 'tasks'} • John's MERN To-Do App
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;