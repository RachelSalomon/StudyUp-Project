import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useJQuery } from "../hooks/useJQuery";
import { jqueryAjax } from "../utils/jqueryApi";

const taskItemStyle = {
  padding: 18,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const jqueryReady = useJQuery();
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    course: "",
    dueDate: "",
    priority: "medium",
    status: "pending",
    category: "",
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    course: "",
    dueDate: "",
    priority: "medium",
    status: "pending",
    category: "",
  });

  const fetchData = async () => {
    if (!jqueryReady) return;
    setError(null);
    try {
      const [tasksRes, coursesRes] = await Promise.all([
        jqueryAjax({ url: "/api/tasks" }),
        jqueryAjax({ url: "/api/courses" }),
      ]);
      setTasks(tasksRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jqueryReady]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Task title is required");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await jqueryAjax({
        url: "/api/tasks",
        method: "POST",
        data: {
          title: form.title,
          description: form.description,
          course: form.course || undefined,
          dueDate: form.dueDate || undefined,
          priority: form.priority,
          status: form.status,
          category: form.category,
        },
      });
      setForm({
        title: "",
        description: "",
        course: "",
        dueDate: "",
        priority: "medium",
        status: "pending",
        category: "",
      });
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditForm({
      title: task.title,
      description: task.description || "",
      course: task.course?._id || task.course || "",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      priority: task.priority || "medium",
      status: task.status || "pending",
      category: task.category || "",
    });
  };

  const handleUpdate = async (id) => {
    if (!editForm.title.trim()) {
      setError("Task title is required");
      return;
    }
    setError(null);
    try {
      await jqueryAjax({
        url: `/api/tasks/${id}`,
        method: "PUT",
        data: {
          title: editForm.title,
          description: editForm.description,
          course: editForm.course || null,
          dueDate: editForm.dueDate || undefined,
          priority: editForm.priority,
          status: editForm.status,
          category: editForm.category,
        },
      });
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleComplete = async (task) => {
    setError(null);
    try {
      await jqueryAjax({
        url: `/api/tasks/${task._id}`,
        method: "PUT",
        data: { isCompleted: !task.isCompleted },
      });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    setError(null);
    try {
      await jqueryAjax({ url: `/api/tasks/${id}`, method: "DELETE" });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const renderCourseName = (courseData) => {
    if (!courseData) return "—";
    if (typeof courseData === "object" && courseData.name) return courseData.name;
    const found = courses.find((c) => c._id === courseData);
    return found ? found.name : "—";
  };

  return (
    <div className="container">
      <h2 className="page-title">Tasks</h2>
      <p style={{ color: "#64748b", marginTop: -8 }}>
        Welcome, {user?.name}. Manage your study tasks below.
      </p>

      <section style={{ marginBottom: 20 }}>
        <h3>Create Task</h3>
        <form onSubmit={handleCreate}>
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
          <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <select name="course" value={form.course} onChange={handleChange}>
            <option value="">No group</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
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
        <div style={taskItemStyle}>
          <strong>No tasks found.</strong>
          <p>Add your first task above.</p>
        </div>
      ) : (
        <ul style={{ display: "grid", gap: 16 }}>
          {tasks.map((t) => (
            <li key={t._id} style={taskItemStyle}>
              {editingId === t._id ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                  <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                  <select value={editForm.course} onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}>
                    <option value="">No group</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => handleUpdate(t._id)}>Save</button>
                    <button type="button" style={{ background: "#64748b" }} onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="checkbox" checked={t.isCompleted} onChange={() => toggleComplete(t)} />
                      <strong>{t.title}</strong>
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => startEdit(t)}>Edit</button>
                      <button type="button" style={{ padding: "6px 12px", fontSize: 13, background: "#fee2e2", color: "#b91c1c" }} onClick={() => deleteTask(t._id)}>Delete</button>
                    </div>
                  </div>
                  <p style={{ margin: 0, color: "#475569" }}>{t.description || "No description."}</p>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", color: "#64748b", fontSize: 14, marginTop: 12 }}>
                    <span>Group: {renderCourseName(t.course)}</span>
                    <span>Priority: {t.priority}</span>
                    <span>Status: {t.status}</span>
                    <span>Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</span>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
