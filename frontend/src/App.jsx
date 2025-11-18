import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/todos");
      setTodos(res.data);
    } catch (err) {
      console.error("Error fetching todos:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Add a new todo
  const handleAdd = async () => {
    if (!newTodo.trim()) return;
    try {
      await axios.post("http://localhost:5001/api/todos", { text: newTodo });
      setNewTodo("");       // clear input
      fetchTodos();         // refresh list
    } catch (err) {
      console.error("Error adding todo:", err);
    }
  };

  // Delete a todo
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/todos/${id}`);
      fetchTodos();         // refresh list
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  return (
    <div className="App" style={{ padding: "2rem" }}>
      <h1>Todo List</h1>

      {/* Add Todo */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter new todo"
          style={{ marginRight: "0.5rem", padding: "0.5rem" }}
        />
        <button onClick={handleAdd} style={{ padding: "0.5rem 1rem" }}>Add</button>
      </div>

      {/* Todo List */}
      {todos.length === 0 && <p>No todos yet!</p>}
      {todos.map((todo) => (
        <div
          key={todo._id}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "0.5rem"
          }}
        >
          <p style={{ marginRight: "1rem" }}>{todo.text}</p>
          <button onClick={() => handleDelete(todo._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default App;
