import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useJQuery } from "../hooks/useJQuery";
import { jqueryAjax } from "../utils/jqueryApi";

const cardStyle = {
  padding: 18,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  marginBottom: 16,
};

const Feed = () => {
  const { user } = useContext(AuthContext);
  const jqueryReady = useJQuery();
  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [content, setContent] = useState("");
  const [courseId, setCourseId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("feed");

  const loadData = async () => {
    if (!jqueryReady) return;
    setError(null);
    try {
      const [feedRes, coursesRes] = await Promise.all([
        jqueryAjax({ url: tab === "feed" ? "/api/posts/feed" : "/api/posts/mine" }),
        jqueryAjax({ url: "/api/courses" }),
      ]);
      setPosts(feedRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [jqueryReady, tab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Post content is required");
      return;
    }
    setError(null);
    try {
      await jqueryAjax({
        url: "/api/posts",
        method: "POST",
        data: { content, course: courseId || null },
      });
      setContent("");
      setCourseId("");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id) => {
    if (!editContent.trim()) {
      setError("Post content cannot be empty");
      return;
    }
    try {
      await jqueryAjax({
        url: `/api/posts/${id}`,
        method: "PUT",
        data: { content: editContent },
      });
      setEditingId(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await jqueryAjax({ url: `/api/posts/${id}`, method: "DELETE" });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Feed</h2>
      <p style={{ color: "#64748b", marginTop: -8 }}>
        Welcome, {user?.name}. Posts from your groups and friends appear here.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setTab("feed")}
          style={tab === "feed" ? styles.activeTab : styles.tab}
        >
          Feed
        </button>
        <button
          type="button"
          onClick={() => setTab("mine")}
          style={tab === "mine" ? styles.activeTab : styles.tab}
        >
          My Posts
        </button>
      </div>

      <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
        <textarea
          placeholder="Share a study update..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">Public (no group)</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit">Publish Post</button>
      </form>

      {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <div style={cardStyle}>No posts yet. Be the first to share something!</div>
      ) : (
        <div className="feed-columns">
          {posts.map((post) => (
            <article key={post._id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong>{post.author?.name || "Unknown"}</strong>
                <span style={{ color: "#64748b", fontSize: 13 }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              {post.course && (
                <span style={styles.badge}>{post.course.name}</span>
              )}
              {editingId === post._id ? (
                <>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                    style={{ marginTop: 10 }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button type="button" onClick={() => handleUpdate(post._id)}>
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      style={{ background: "#64748b" }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <p style={{ margin: "10px 0", color: "#475569" }}>{post.content}</p>
              )}
              {post.author?._id?.toString() === user?.id?.toString() && editingId !== post._id && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    style={styles.smallBtn}
                    onClick={() => {
                      setEditingId(post._id);
                      setEditContent(post.content);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    style={{ ...styles.smallBtn, background: "#fee2e2", color: "#b91c1c" }}
                    onClick={() => handleDelete(post._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  tab: {
    background: "#e2e8f0",
    color: "#334155",
    padding: "8px 16px",
    borderRadius: 12,
  },
  activeTab: {
    background: "#2563eb",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: 12,
  },
  badge: {
    display: "inline-block",
    marginTop: 6,
    padding: "2px 10px",
    borderRadius: 999,
    background: "rgba(37, 99, 235, 0.12)",
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 600,
  },
  smallBtn: {
    padding: "6px 12px",
    fontSize: 13,
    borderRadius: 10,
  },
};

export default Feed;
