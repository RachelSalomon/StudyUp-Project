import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    course: "",
    dueDate: "",
  });
  const [creating, setCreating] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/api/tasks");
      setTasks(res.data.data || []);
    } catch (err) {
      setError("Unable to load tasks. Please refresh or try again later.");
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/api/courses");
      setCourses(res.data.data || []);
    } catch (err) {
      setError("Unable to load courses. Please refresh or try again later.");
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchTasks(), fetchCourses()]);
      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        course: form.course || undefined,
        dueDate: form.dueDate || undefined,
      };
      const res = await axios.post("/api/tasks", payload);
      setTasks((prev) => [res.data.data, ...prev]);
      setForm({ title: "", description: "", course: "", dueDate: "" });
    } catch (err) {
      setError("Unable to create task. Please try again.");
      console.error("create task error", err);
    } finally {
      setCreating(false);
    }
  };

  const toggleComplete = async (task) => {
    setError(null);
    try {
      const res = await axios.put(`/api/tasks/${task._id}`, {
        isCompleted: !task.isCompleted,
      });
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? res.data.data : t)),
      );
    } catch (err) {
      setError("Unable to update task. Please try again.");
      console.error("toggle error", err);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    setError(null);
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError("Unable to delete task. Please try again.");
      console.error("delete error", err);
    }
  };

  // Helper function to safely render course name from text or populated object
  const renderCourseName = (courseData) => {
    if (!courseData) return "—";
    if (typeof courseData === "object" && courseData.name) {
      return courseData.name;
    }
    const found = courses.find((c) => c._id === courseData);
    return found ? found.name : "—";
  };

  return (
    <div className="container">
      <h2>Welcome, {user?.name}</h2>

      <section style={{ marginBottom: 20 }}>
        <h3>Create Task</h3>
        <form onSubmit={handleCreate}>
          <div>
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div>
            <select name="course" value={form.course} onChange={handleChange}>
              <option value="">No course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
            />
          </div>
          <button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Add Task"}
          </button>
        </form>
      </section>

      <h3>Your Tasks</h3>
      {error && <p style={{ color: "#ef4444", marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div style={styles.emptyState}>
          <strong>No tasks found.</strong>
          <p>Add your first task above to keep track of your study work.</p>
        </div>
      ) : (
        <ul style={styles.taskList}>
          {tasks.map((t) => (
            <li key={t._id} style={styles.taskItem}>
              <div style={styles.taskHeader}>
                <label style={styles.taskLabel}>
                  <input
                    type="checkbox"
                    checked={t.isCompleted}
                    onChange={() => toggleComplete(t)}
                  />
                  <strong style={{ marginLeft: 10 }}>{t.title}</strong>
                </label>
                <button
                  style={styles.taskDelete}
                  onClick={() => deleteTask(t._id)}
                >
                  Delete
                </button>
              </div>
              <p style={styles.taskText}>
                {t.description || "No description provided."}
              </p>
              <div style={styles.taskMeta}>
                <span>Course: {renderCourseName(t.course)}</span>
                <span>
                  Due:{" "}
                  {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  emptyState: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 20,
    color: "#475569",
  },
  taskList: {
    display: "grid",
    gap: 16,
  },
  taskItem: {
    padding: 18,
    borderRadius: 18,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  taskHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  taskLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  taskText: {
    margin: 0,
    color: "#475569",
  },
  taskMeta: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    color: "#64748b",
    fontSize: 14,
    marginTop: 12,
  },
  taskDelete: {
    border: "none",
    borderRadius: 12,
    padding: "8px 12px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default Dashboard;
