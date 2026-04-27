import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

/**
 * Axios Global Configuration
 * Uses environment variables for API URL routing
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 60000; // Increased to 60s for Render Free Tier cold starts

// Log the API URL in production to debug "NetworkError" issues
if (import.meta.env.PROD) {
  console.log(`🚀 API Base URL: ${API_URL}`);
  if (API_URL.includes('localhost')) {
    console.warn("⚠️ Warning: Frontend is in production but pointing to localhost! Check Vercel Env Vars.");
  }
}

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // --- Lifecycle & Network Monitoring ---

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/api/todos");
      setTodos(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError("Server is taking too long to wake up. Please refresh in a minute.");
      } else if (!err.response) {
        setError("Network Error: Check CORS settings or Server status.");
      } else {
        setError(err.response?.data?.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  // --- Event Handlers ---

  const handleAdd = async () => {
    const text = newTodo.trim();
    if (!text) return setError("Please enter a task.");
    if (text.length > 200) return setError("Task is too long (max 200 chars).");
    if (!isOnline) {
      setError("You're offline. Todo will be added when you're back online.");
      return;
    }

    const tempId = Date.now().toString();
    const optimisticTodo = { _id: tempId, text, completed: false };

    setTodos(prev => [...prev, optimisticTodo]);
    setNewTodo("");
    setError("");

    try {
      const { data } = await axios.post("/api/todos", { text });
      setTodos(prev => prev.map(t => (t._id === tempId ? data.data : t)));
    } catch (err) {
      setError(`Failed to save: ${err.response?.data?.message || err.message}`);
      setTodos(prev => prev.filter(t => t._id !== tempId));
    }
  };

  const handleDelete = async (id) => {
    if (!isOnline) return setError("Connectivity required to delete tasks.");

    const snapshot = [...todos];
    setTodos(prev => prev.filter(t => t._id !== id));
    setError("");

    try {
      await axios.delete(`/api/todos/${id}`);
    } catch (err) {
      setError(`Failed to delete: ${err.response?.data?.message || err.message}`);
      setTodos(snapshot);
    }
  };

  return (
    <div className="page-container gradient-bg">
      <div className="content-container">
        <main className="w-full max-w-lg mx-auto shadow-xl card">
          <header className="border-b card-header border-slate-100">
            <h1 className="text-3xl text-center text-display text-slate-800 sm:text-4xl">
              John's Todo List
            </h1>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div
                className={`w-3 h-3 rounded-full ring-2 ring-offset-2 transition-all duration-300 ${
                  isOnline ? 'bg-green-500 ring-green-100 animate-pulse' : 'bg-red-500 ring-red-100'
                }`}
              />
              <span className={`text-xs font-bold uppercase tracking-wider ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Connected' : 'Offline'}
              </span>
            </div>
          </header>

          <section className="p-6 bg-white border-b border-slate-50">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="What needs to be done?"
                maxLength={200}
                disabled={!isOnline || loading}
                className="flex-1 px-4 py-3 transition-all border outline-none bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                onClick={handleAdd}
                disabled={!isOnline || loading || !newTodo.trim()}
                className="px-6 py-3 font-bold text-white transition-all bg-indigo-600 shadow-sm hover:bg-indigo-700 rounded-xl active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {loading ? '...' : 'ADD'}
              </button>
            </div>

            {error && (
              <div className="flex items-center justify-between p-3 mt-4 text-sm alert-error">
                <span>{error}</span>
                <button onClick={() => setError("")} className="font-bold hover:opacity-70">×</button>
              </div>
            )}
          </section>

          <section className="bg-white card-body">
            {todos.length === 0 && !loading ? (
              <div className="py-16 text-center text-slate-400 opacity-60">
                <div className="mb-4 text-6xl opacity-70">📋</div>
                <p className="text-lg font-medium text-display">Your list is empty</p>
                <p className="text-sm">Time to add some goals!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {todos.map((todo) => (
                  <li
                    key={todo._id}
                    className="flex items-center justify-between p-4 transition-all border group bg-slate-50 border-slate-100 rounded-xl hover:border-indigo-200"
                  >
                    <span className="flex-1 mr-4 font-medium break-words text-slate-700">
                      {todo.text}
                    </span>
                    <button
                      onClick={() => handleDelete(todo._id)}
                      disabled={!isOnline}
                      className="btn-danger px-3 py-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      REMOVE
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <footer className="px-6 py-4 text-center border-t bg-slate-50/50 border-slate-100">
            <p className="text-xs font-bold tracking-widest uppercase text-slate-400">
              {todos.length} {todos.length === 1 ? 'Task' : 'Tasks'} Remaining
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;