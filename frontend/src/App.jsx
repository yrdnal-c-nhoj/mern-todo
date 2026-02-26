import React, { useEffect, useState } from "react";
import axios from "axios";

// ✅ Set this ONCE at module level, not inside the component
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
axios.defaults.withCredentials = false;


function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  axios.defaults.baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD 
    ? 'https://your-backend-url.com'
    : 'http://localhost:5001');
  
  axios.defaults.withCredentials = false;

  const fetchTodos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/todos");
      setTodos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Failed to fetch todos: ${err.response?.data?.error || err.message}`);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAdd = async () => {
    if (!newTodo.trim()) return;

    const tempId = Date.now();
    const newTodoObj = { _id: tempId, text: newTodo };

    setTodos((prev) => [...prev, newTodoObj]);
    setNewTodo("");

    try {
      const res = await axios.post("/api/todos", { text: newTodo });
      setTodos((prev) =>
        prev.map((todo) => (todo._id === tempId ? res.data : todo))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to add todo");
      setTodos((prev) => prev.filter((todo) => todo._id !== tempId));
    }
  };

  const handleDelete = async (id) => {
    const originalTodos = [...todos];
    setTodos((prev) => prev.filter((todo) => todo._id !== id));

    try {
      await axios.delete(`/api/todos/${id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to delete todo");
      setTodos(originalTodos);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-blue-50">
      <div className="w-full max-w-xl p-6 bg-white shadow-lg sm:p-8 rounded-xl">
        <h1 className="mb-6 text-2xl font-semibold text-center text-slate-900 sm:text-3xl">
          To-Do List
        </h1>

        <div className="flex flex-col gap-3 mb-6 sm:flex-row">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Enter new todo"
            className="flex-1 px-3 py-2 text-sm border rounded-lg shadow-sm bg-slate-50 border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-base"
          />
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-base"
          >
            Add
          </button>
        </div>

        {loading && (
          <p className="mb-3 text-sm text-slate-600">Loading todos...</p>
        )}
        {error && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}

        {!loading && (!Array.isArray(todos) || todos.length === 0) ? (
          <p className="text-sm text-center text-slate-500">No todos yet!</p>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo._id}
                className="flex items-center justify-between px-3 py-2 border rounded-lg bg-slate-50 border-slate-200"
              >
                <p className="flex-1 mr-3 break-words text-slate-800">{todo.text}</p>
                <button
                  onClick={() => handleDelete(todo._id)}
                  className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-md bg-red-50 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
