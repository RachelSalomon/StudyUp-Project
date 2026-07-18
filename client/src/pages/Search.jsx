import React, { useState } from "react";
import { useJQuery } from "../hooks/useJQuery";
import { jqueryAjax, buildQuery } from "../utils/jqueryApi";

const resultStyle = {
  padding: 14,
  borderRadius: 14,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  marginBottom: 10,
};

const Search = () => {
  const jqueryReady = useJQuery();
  const [error, setError] = useState(null);
  const [taskInfo, setTaskInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [taskResults, setTaskResults] = useState([]);
  const [courseResults, setCourseResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [userResults, setUserResults] = useState([]);

  const [taskForm, setTaskForm] = useState({
    title: "",
    courseName: "",
    status: "",
    priority: "",
    category: "",
  });

  const [courseForm, setCourseForm] = useState({
    name: "",
    professor: "",
    category: "",
    status: "",
    minCredits: "",
    maxCredits: "",
  });

  const [postForm, setPostForm] = useState({
    content: "",
    courseName: "",
    tags: "",
    dateRange: "",
  });

  const [userForm, setUserForm] = useState({
    name: "",
    role: "",
    bio: "",
    theme: "",
  });

  const searchTasks = async (e) => {
    e.preventDefault();
    if (!jqueryReady) {
      setError("jQuery is still loading — please wait a moment and try again");
      return;
    }
    setError(null);
    setTaskInfo(null);
    try {
      const res = await jqueryAjax({
        url: `/api/search/tasks${buildQuery(taskForm)}`,
      });
      const results = res.data || [];
      setTaskResults(results);
      if (results.length === 0) {
        setTaskInfo(res.message || "No tasks matched your search");
      } else {
        setTaskInfo(`Found ${results.length} task(s)`);
      }
    } catch (err) {
      setError(err.message);
      setTaskResults([]);
      setTaskInfo(null);
    }
  };

  const searchCourses = async (e) => {
    e.preventDefault();
    if (!jqueryReady) return;
    setError(null);
    try {
      const res = await jqueryAjax({
        url: `/api/search/courses${buildQuery(courseForm)}`,
      });
      setCourseResults(res.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const searchPosts = async (e) => {
    e.preventDefault();
    if (!jqueryReady) return;
    setError(null);
    try {
      const res = await jqueryAjax({
        url: `/api/search/posts${buildQuery(postForm)}`,
      });
      setPostResults(res.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const searchUsersHandler = async (e) => {
    e.preventDefault();
    if (!jqueryReady) return;
    setError(null);
    setUserInfo(null);
    try {
      const res = await jqueryAjax({
        url: `/api/search/users${buildQuery(userForm)}`,
      });
      const results = res.data || [];
      setUserResults(results);
      if (results.length === 0) {
        setUserInfo("No users matched your search");
      } else {
        setUserInfo(`Found ${results.length} user(s)`);
      }
    } catch (err) {
      setError(err.message);
      setUserResults([]);
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Search</h2>
      <p style={{ color: "#64748b", marginTop: -8 }}>
        Advanced search with multiple parameters (jQuery Ajax)
      </p>
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}

      <section style={{ marginBottom: 32 }}>
        <h3>Search Tasks</h3>
        <form onSubmit={searchTasks} className="search-grid">
          <input
            placeholder="Task title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />
          <input
            placeholder="Group name"
            value={taskForm.courseName}
            onChange={(e) => setTaskForm({ ...taskForm, courseName: e.target.value })}
          />
          <select
            value={taskForm.status}
            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
          >
            <option value="">Any status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={taskForm.priority}
            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
          >
            <option value="">Any priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            placeholder="Category"
            value={taskForm.category}
            onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
          />
          <button type="submit">Search Tasks</button>
        </form>
        {taskInfo && (
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 10 }}>{taskInfo}</p>
        )}
        {taskResults.map((t) => (
          <div key={t._id} style={resultStyle}>
            <strong>{t.title}</strong> — {t.status}, {t.priority}
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h3>Search Groups (Courses)</h3>
        <form onSubmit={searchCourses} className="search-grid">
          <input
            placeholder="Group name"
            value={courseForm.name}
            onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
          />
          <input
            placeholder="Professor"
            value={courseForm.professor}
            onChange={(e) => setCourseForm({ ...courseForm, professor: e.target.value })}
          />
          <input
            placeholder="Category"
            value={courseForm.category}
            onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
          />
          <select
            value={courseForm.status}
            onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
          >
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="draft">Draft</option>
          </select>
          <input
            type="number"
            placeholder="Min credits"
            value={courseForm.minCredits}
            onChange={(e) => setCourseForm({ ...courseForm, minCredits: e.target.value })}
          />
          <input
            type="number"
            placeholder="Max credits"
            value={courseForm.maxCredits}
            onChange={(e) => setCourseForm({ ...courseForm, maxCredits: e.target.value })}
          />
          <button type="submit">Search Groups</button>
        </form>
        {courseResults.map((c) => (
          <div key={c._id} style={resultStyle}>
            <strong>{c.name}</strong> — {c.professor || "N/A"}, {c.credits} credits
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h3>Search Posts</h3>
        <form onSubmit={searchPosts} className="search-grid">
          <input
            placeholder="Content keyword"
            value={postForm.content}
            onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
          />
          <input
            placeholder="Group name"
            value={postForm.courseName}
            onChange={(e) => setPostForm({ ...postForm, courseName: e.target.value })}
          />
          <input
            placeholder="Tags (comma separated)"
            value={postForm.tags}
            onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
          />
          <input
            placeholder="Date range (YYYY-MM-DD,YYYY-MM-DD)"
            value={postForm.dateRange}
            onChange={(e) => setPostForm({ ...postForm, dateRange: e.target.value })}
          />
          <button type="submit">Search Posts</button>
        </form>
        {postResults.map((p) => (
          <div key={p._id} style={resultStyle}>
            <strong>{p.author?.name}</strong>: {p.content.slice(0, 80)}
          </div>
        ))}
      </section>

      <section>
        <h3>Search Users</h3>
        <form onSubmit={searchUsersHandler} className="search-grid">
          <input
            placeholder="Name or email"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
          />
          <select
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
          >
            <option value="">Any role</option>
            <option value="student">Student</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <input
            placeholder="Bio keyword"
            value={userForm.bio}
            onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })}
          />
          <select
            value={userForm.theme}
            onChange={(e) => setUserForm({ ...userForm, theme: e.target.value })}
          >
            <option value="">Any theme</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <button type="submit">Search Users</button>
        </form>
        {userInfo && (
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 10 }}>{userInfo}</p>
        )}
        {userResults.map((u) => (
          <div key={u._id} style={resultStyle}>
            <strong>{u.name}</strong> — {u.role}
            {u.email && ` · ${u.email}`}
            {u.bio && ` · ${u.bio}`}
          </div>
        ))}
      </section>
    </div>
  );
};

export default Search;
