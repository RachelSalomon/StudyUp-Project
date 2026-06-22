import React, { useEffect, useState } from "react";
import axios from "axios";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/courses");
      setCourses(res.data.data || []);
    } catch (err) {
      setError("Unable to load courses. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await axios.post("/api/courses", { name });
      setName("");
      await fetchCourses();
    } catch (err) {
      setError("Unable to add course. Please try again.");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="container">
      <h2>Courses</h2>
      <form onSubmit={handleAdd} style={styles.form}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Course name"
          required
          style={styles.input}
        />
        <button type="submit" disabled={creating} style={styles.button}>
          {creating ? "Adding..." : "Add"}
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length === 0 ? (
        <div style={styles.emptyState}>
          <strong>No courses yet.</strong>
          <p>Add a course above to begin organizing your tasks.</p>
        </div>
      ) : (
        <ul style={styles.courseList}>
          {courses.map((c) => (
            <li key={c._id} style={styles.courseItem}>
              <span>{c.name}</span>
              <span style={styles.creditTag}>{c.credits || 0} credits</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  form: {
    display: "grid",
    gap: 14,
    marginBottom: 20,
  },
  input: {
    width: "100%",
  },
  button: {
    width: 120,
  },
  error: {
    color: "#ef4444",
    marginBottom: 16,
  },
  emptyState: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 20,
    color: "#475569",
  },
  courseList: {
    display: "grid",
    gap: 14,
  },
  courseItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: 16,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
  },
  creditTag: {
    color: "#64748b",
    fontWeight: 700,
  },
};

export default Courses;
