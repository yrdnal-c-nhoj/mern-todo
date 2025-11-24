import React, { useEffect, useState } from "react";
import axios from "axios";

// Main App component for the To-Do List application
function App() {
  // State variables to manage the app's data
  const [todos, setTodos] = useState([]); // Array of todo objects
  const [newTodo, setNewTodo] = useState(""); // Input text for new todo
  const [loading, setLoading] = useState(false); // Flag for loading states
  const [error, setError] = useState(""); // Error message string

  // Configure axios base URL for API calls to the backend server
  // This sets the default endpoint for all axios requests
  axios.defaults.baseURL = "http://localhost:5001";

  // Function to retrieve all todos from the backend API using axios
  // Axios sends HTTP GET request to "/api/todos" and handles response/error
  // Implements loading state and error handling
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

  // useEffect hook runs once on component mount to fetch todos
  useEffect(() => {
    fetchTodos();
  }, []);

  // Function to add a new todo with optimistic UI update
  // First updates UI immediately, then sends axios POST to backend
  // Replaces temp todo with real data from server response
  // Handles errors by rolling back UI changes
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

  // Function to delete a todo with optimistic UI update
  // Saves original todos for potential rollback
  // Immediately removes todo from UI
  // Sends axios DELETE request to "/api/todos/{id}"
  // On error, logs, sets error, and restores original todos
  const handleDelete = async (id) => {
    const originalTodos = [...todos];
    setTodos((prev) => prev.filter((todo) => todo._id !== id));

    try {
      await axios.delete(`/api/todos/${id}`); // axios.delete makes DELETE request
    } catch (err) {
      console.error(err);
      setError("Failed to delete todo");
      setTodos(originalTodos); // rollback if API fails
    }
  };

  // Render the UI
  // Main container with Tailwind CSS styling for responsive, centered layout
  // Uses blue background, white card with shadow
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl bg-pink-500 shadow-lg rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-6 text-center">
          My To-Do List
        </h1>

        {/* Section for adding new todo */}
        {/* Input field bound to newTodo state, onChange updates state */}
        {/* onKeyDown triggers handleAdd on Enter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Enter new todo"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
          />
          {/* Button calls handleAdd on click */}
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm sm:text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
          >
            Add
          </button>
        </div>

        {/* Conditionally render loading or error messages */}
        {loading && (
          <p className="text-sm text-slate-600 mb-3">Loading todos...</p>
        )}
        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        {/* Todo list display */}
        {/* Checks if loading is false and todos is empty array or not array */}
        {!loading && (!Array.isArray(todos) || todos.length === 0) ? (
          <p className="text-sm text-slate-500 text-center">No todos yet!</p>
        ) : (
          <div className="space-y-2">
            {/* Maps over todos array to render each todo */}
            {todos.map((todo) => (
              <div
                key={todo._id} // Unique key for React reconciliation
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                {/* Display todo text, flexible to take space */}
                <p className="text-slate-800 break-words mr-3 flex-1">{todo.text}</p>
                {/* Delete button calls handleDelete with todo._id */}
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
