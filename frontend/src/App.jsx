import React, { useEffect, useState } from "react";
import axios from "axios";

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
    <div className="flex justify-center items-center bg-blue-50 px-4 py-8 min-h-screen">
      <div className="bg-white shadow-lg p-6 sm:p-8 rounded-xl w-full max-w-xl">
        <h1 className="mb-6 font-semibold text-slate-900 text-2xl sm:text-3xl text-center">
          To-Do List
        </h1>

        <div className="flex sm:flex-row flex-col gap-3 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Enter new todo"
            className="flex-1 bg-slate-50 shadow-sm px-3 py-2 border border-slate-300 focus:border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
          />
          <button
            onClick={handleAdd}
            className="inline-flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 shadow-sm px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium text-white text-sm sm:text-base"
          >
            Add
          </button>
        </div>

        {loading && (
          <p className="mb-3 text-slate-600 text-sm">Loading todos...</p>
        )}
        {error && (
          <p className="mb-3 text-red-600 text-sm">{error}</p>
        )}

        {!loading && (!Array.isArray(todos) || todos.length === 0) ? (
          <p className="text-slate-500 text-sm text-center">No todos yet!</p>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo._id}
                className="flex justify-between items-center bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg"
              >
                <p className="flex-1 mr-3 text-slate-800 break-words">{todo.text}</p>
                <button
                  onClick={() => handleDelete(todo._id)}
                  className="inline-flex justify-center items-center bg-red-50 hover:bg-red-100 px-2 py-1 border border-red-200 rounded-md font-medium text-red-600 text-xs"
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
