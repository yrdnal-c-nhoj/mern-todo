import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set your backend base URL if needed
  axios.defaults.baseURL = "http://localhost:5001";

  // Fetch all todos
  const fetchTodos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/todos");
      setTodos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch todos");
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Add a new todo (optimistic UI update)
  const handleAdd = async () => {
    if (!newTodo.trim()) return;

    const tempId = Date.now(); // temporary ID for UI
    const newTodoObj = { _id: tempId, text: newTodo };

    setTodos((prev) => [...prev, newTodoObj]);
    setNewTodo("");

    try {
      const res = await axios.post("/api/todos", { text: newTodo });
      // Replace temp todo with real one from server
      setTodos((prev) =>
        prev.map((todo) => (todo._id === tempId ? res.data : todo))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to add todo");
      // Remove temporary todo if API fails
      setTodos((prev) => prev.filter((todo) => todo._id !== tempId));
    }
  };

  // Delete a todo (optimistic UI update)
  const handleDelete = async (id) => {
    const originalTodos = [...todos];
    setTodos((prev) => prev.filter((todo) => todo._id !== id));

    try {
      await axios.delete(`/api/todos/${id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to delete todo");
      setTodos(originalTodos); // rollback if API fails
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-6 text-center">
          To-Do List
        </h1>

        {/* Add Todo */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Enter new todo"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
          />
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm sm:text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
          >
            Add
          </button>
        </div>

        {/* Loading/Error */}
        {loading && (
          <p className="text-sm text-slate-600 mb-3">Loading todos...</p>
        )}
        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        {/* Todo List */}
        {!loading && (!Array.isArray(todos) || todos.length === 0) ? (
          <p className="text-sm text-slate-500 text-center">No todos yet!</p>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo._id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <p className="text-slate-800 break-words mr-3 flex-1">{todo.text}</p>
                <button
                  onClick={() => handleDelete(todo._id)}
                  className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
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
