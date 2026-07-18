import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useJQuery } from "../hooks/useJQuery";
import { jqueryAjax } from "../utils/jqueryApi";

const cardStyle = {
  padding: 16,
  borderRadius: 14,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  marginBottom: 12,
};

const sameId = (a, b) => {
  if (!a || !b) return false;
  return String(a) === String(b);
};

function Courses() {
  const { user } = useContext(AuthContext);
  const jqueryReady = useJQuery();
  const [courses, setCourses] = useState([]);
  const [browse, setBrowse] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    professor: "",
    category: "",
    isPrivate: false,
  });

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    professor: "",
    category: "",
    isPrivate: false,
  });

  const fetchCourses = async () => {
    if (!jqueryReady) return;
    try {
      const [mine, available] = await Promise.all([
        jqueryAjax({ url: "/api/courses" }),
        jqueryAjax({ url: "/api/courses/browse" }),
      ]);
      setCourses(mine.data || []);
      setBrowse(available.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [jqueryReady]);

  const canManage = (course) =>
    user?.role === "admin" ||
    sameId(course.manager?._id || course.manager, user?.id) ||
    sameId(course.creator?._id || course.creator, user?.id);

  const pendingRequests = courses.flatMap((course) => {
    if (!canManage(course)) return [];
    return (course.pendingMembers || []).map((p) => ({
      courseId: course._id,
      courseName: course.name,
      userId: p.userId?._id || p.userId,
      userName: p.userId?.name || p.userId?.email || "User",
    }));
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name.trim()) {
      setError("Group name is required");
      return;
    }
    try {
      await jqueryAjax({ url: "/api/courses", method: "POST", data: form });
      setForm({ name: "", description: "", professor: "", category: "", isPrivate: false });
      setSuccess("Group created");
      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id) => {
    if (!editForm.name.trim()) {
      setError("Group name is required");
      return;
    }
    try {
      await jqueryAjax({ url: `/api/courses/${id}`, method: "PUT", data: editForm });
      setEditingId(null);
      setSuccess("Group updated");
      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    try {
      await jqueryAjax({ url: `/api/courses/${id}`, method: "DELETE" });
      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoin = async (id) => {
    try {
      await jqueryAjax({ url: `/api/courses/${id}/join`, method: "POST" });
      setSuccess("Join request sent — waiting for group manager to approve");
      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApprove = async (courseId, userId) => {
    try {
      await jqueryAjax({
        url: `/api/courses/${courseId}/approve`,
        method: "POST",
        data: { userId: String(userId) },
      });
      setSuccess("Member approved");
      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (courseId, userId) => {
    try {
      await jqueryAjax({
        url: `/api/courses/${courseId}/reject`,
        method: "POST",
        data: { userId: String(userId) },
      });
      setSuccess("Request rejected");
      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Study Groups</h2>
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      {success && <p style={{ color: "#16a34a" }}>{success}</p>}

      {pendingRequests.length > 0 && (
        <section
          style={{
            marginBottom: 24,
            padding: 18,
            borderRadius: 14,
            background: "#fffbeb",
            border: "2px solid #fcd34d",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#92400e" }}>
            Pending join requests ({pendingRequests.length})
          </h3>
          <p style={{ color: "#78350f", fontSize: 14, marginTop: -4 }}>
            Students asked to join your groups — click Approve to accept them.
          </p>
          {pendingRequests.map((req) => (
            <div
              key={`${req.courseId}-${req.userId}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid #fde68a",
              }}
            >
              <span>
                <strong>{req.userName}</strong> → group <strong>{req.courseName}</strong>
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  style={{ padding: "6px 14px", fontSize: 13 }}
                  onClick={() => handleApprove(req.courseId, req.userId)}
                >
                  Approve
                </button>
                <button
                  type="button"
                  style={{ padding: "6px 14px", fontSize: 13, background: "#64748b" }}
                  onClick={() => handleReject(req.courseId, req.userId)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      <form onSubmit={handleAdd} style={{ marginBottom: 28 }}>
        <h3>Create Group</h3>
        <input
          placeholder="Group name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          placeholder="Professor"
          value={form.professor}
          onChange={(e) => setForm({ ...form, professor: e.target.value })}
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={form.isPrivate}
            onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })}
          />
          Private group
        </label>
        <button type="submit">Create Group</button>
      </form>

      <h3>My Groups</h3>
      {courses.length === 0 ? (
        <p style={{ color: "#64748b" }}>No groups yet.</p>
      ) : (
        courses.map((course) => (
          <div key={course._id} style={cardStyle}>
            {editingId === course._id ? (
              <div style={{ display: "grid", gap: 10 }}>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                <input value={editForm.professor} onChange={(e) => setEditForm({ ...editForm, professor: e.target.value })} />
                <input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={editForm.isPrivate} onChange={(e) => setEditForm({ ...editForm, isPrivate: e.target.checked })} />
                  Private
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => handleUpdate(course._id)}>Save</button>
                  <button type="button" style={{ background: "#64748b" }} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{course.name}</strong>
                    {course.isPrivate && <span style={{ marginLeft: 8, fontSize: 12, color: "#64748b" }}>(Private)</span>}
                    {canManage(course) && (course.pendingMembers?.length || 0) > 0 && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: "#b45309", fontWeight: 600 }}>
                        ({course.pendingMembers.length} pending)
                      </span>
                    )}
                    <p style={{ margin: "4px 0", color: "#64748b", fontSize: 14 }}>
                      {course.professor && `${course.professor} · `}{course.members?.length || 0} members
                      {canManage(course) && " · You manage this group"}
                    </p>
                  </div>
                  {canManage(course) && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        style={{ padding: "6px 12px", fontSize: 13 }}
                        onClick={() => {
                          setEditingId(course._id);
                          setEditForm({
                            name: course.name,
                            description: course.description || "",
                            professor: course.professor || "",
                            category: course.category || "",
                            isPrivate: course.isPrivate,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        style={{ padding: "6px 12px", fontSize: 13, background: "#fee2e2", color: "#b91c1c" }}
                        onClick={() => handleDelete(course._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {canManage(course) && course.pendingMembers?.length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                    <strong style={{ fontSize: 14 }}>Pending requests:</strong>
                    {course.pendingMembers.map((p) => (
                      <div key={p.userId?._id || p.userId} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                        <span>{p.userId?.name || "User"}</span>
                        <button type="button" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => handleApprove(course._id, p.userId?._id || p.userId)}>
                          Approve
                        </button>
                        <button type="button" style={{ padding: "4px 10px", fontSize: 12, background: "#64748b" }} onClick={() => handleReject(course._id, p.userId?._id || p.userId)}>
                          Reject
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))
      )}

      {browse.length > 0 && (
        <>
          <h3 style={{ marginTop: 28 }}>Join a Group</h3>
          {browse.map((course) => (
            <div key={course._id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{course.name}</strong>
                  <p style={{ margin: "4px 0", color: "#64748b", fontSize: 14 }}>{course.description}</p>
                </div>
                <button type="button" style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => handleJoin(course._id)}>
                  Request Join
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default Courses;
