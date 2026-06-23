import React, { useState, useEffect } from "react";
import axios from "axios";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all user courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setCourses(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!courseName.trim()) {
      setError("Course name cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/courses",
        { name: courseName },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setSuccess("Course added successfully!");
        setCourseName("");
        fetchCourses();
      }
    } catch (err) {
      setError("Unable to add course. Please try again.");
      console.error(err);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `http://localhost:5000/api/courses/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        fetchCourses();
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete the course.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Courses</h2>

      <form onSubmit={handleAddCourse} style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Course name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            style={{ padding: "10px", fontSize: "16px" }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: "10px 24px" }}
          >
            Add
          </button>
        </div>
        {error && (
          <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
        )}
        {success && (
          <div style={{ color: "green", marginTop: "10px" }}>{success}</div>
        )}
      </form>

      <div>
        <h4>Your Enrolled Courses</h4>
        {courses.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            No courses yet. Add a course above to begin organizing your tasks.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {courses.map((course) => (
              <li
                key={course._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between", //  Fixed to valid CSS value
                  alignItems: "center",
                  padding: "12px",
                  borderBottom: "1px solid #eee",
                  backgroundColor: "#fff",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                  {course.name}
                </span>
                <button
                  onClick={() => handleDeleteCourse(course._id)}
                  className="btn btn-danger btn-sm"
                  style={{
                    backgroundColor: "#dc3545",
                    borderColor: "#dc3545",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Courses;
