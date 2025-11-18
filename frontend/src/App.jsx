import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set your backend base URL if needed
  axios.defaults.baseURL = "http://localhost:5000";

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
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Todo List</h1>

      {/* Add Todo */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Enter new todo"
          style={{ marginRight: "0.5rem", padding: "0.5rem", width: "250px" }}
        />
        <button
          onClick={handleAdd}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Add
        </button>
      </div>

      {/* Loading/Error */}
      {loading && <p>Loading todos...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Todo List */}
      {!loading && (!Array.isArray(todos) || todos.length === 0) ? (
        <p>No todos yet!</p>
      ) : (
        todos.map((todo) => (
          <div
            key={todo._id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <p style={{ marginRight: "1rem" }}>{todo.text}</p>
            <button
              onClick={() => handleDelete(todo._id)}
              style={{
                padding: "0.25rem 0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
