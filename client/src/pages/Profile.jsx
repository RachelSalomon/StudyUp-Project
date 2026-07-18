import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useJQuery } from "../hooks/useJQuery";
import { jqueryAjax } from "../utils/jqueryApi";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const jqueryReady = useJQuery();

  const [profile, setProfile] = useState({ name: "", bio: "", email: "" });
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadAll = async () => {
    if (!jqueryReady) return;
    setError(null);
    try {
      const [profileRes, usersRes, friendsRes, pendingRes] = await Promise.all([
        jqueryAjax({ url: "/api/auth/profile" }),
        jqueryAjax({ url: "/api/auth/users" }),
        jqueryAjax({ url: "/api/friends" }),
        jqueryAjax({ url: "/api/friends/pending" }),
      ]);
      setProfile({
        name: profileRes.data.name || "",
        bio: profileRes.data.bio || "",
        email: profileRes.data.email || "",
      });
      setUsers(usersRes.data || []);
      setFriends(friendsRes.data || []);
      setPending(pendingRes.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadAll();
  }, [jqueryReady]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      setError("Name is required");
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await jqueryAjax({
        url: "/api/auth/profile",
        method: "PUT",
        data: { name: profile.name, bio: profile.bio },
      });
      setSuccess("Profile updated");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Deactivate your account?")) return;
    try {
      await jqueryAjax({
        url: `/api/auth/profile/${user.id}`,
        method: "DELETE",
      });
      logout();
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await jqueryAjax({
        url: "/api/friends/request",
        method: "POST",
        data: { userId },
      });
      setSuccess("Friend request sent");
    } catch (err) {
      setError(err.message);
    }
  };

  const acceptRequest = async (id) => {
    try {
      await jqueryAjax({ url: `/api/friends/${id}/accept`, method: "PUT" });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const friendIds = new Set(friends.map((f) => f._id));

  return (
    <div className="container">
      <h2 className="page-title">Profile</h2>
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      {success && <p style={{ color: "#16a34a" }}>{success}</p>}

      <section style={{ marginBottom: 28 }}>
        <h3>My Profile</h3>
        <form onSubmit={handleUpdate}>
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Name"
            required
          />
          <input value={profile.email} disabled />
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Bio"
            rows={3}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit">Update Profile</button>
            <button
              type="button"
              onClick={handleDeactivate}
              style={{ background: "#ef4444" }}
            >
              Deactivate Account
            </button>
          </div>
        </form>
      </section>

      {pending.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h3>Friend Requests</h3>
          {pending.map((req) => (
            <div
              key={req._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                borderBottom: "1px solid #eee",
              }}
            >
              <span>{req.requester?.name}</span>
              <button type="button" onClick={() => acceptRequest(req._id)}>
                Accept
              </button>
            </div>
          ))}
        </section>
      )}

      <section style={{ marginBottom: 28 }}>
        <h3>Friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <p style={{ color: "#64748b" }}>No friends yet.</p>
        ) : (
          <ul>
            {friends.map((f) => (
              <li key={f._id} style={{ padding: "8px 0" }}>
                {f.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>All Users</h3>
        <div className="user-columns">
          {users
            .filter((u) => u._id !== user?.id && u._id !== user?._id)
            .map((u) => (
              <div
                key={u._id}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  marginBottom: 10,
                }}
              >
                <strong>{u.name}</strong>
                <p style={{ margin: "4px 0", color: "#64748b", fontSize: 14 }}>
                  {u.role} {u.bio && `· ${u.bio}`}
                </p>
                {!friendIds.has(u._id) && (
                  <button
                    type="button"
                    style={{ padding: "6px 12px", fontSize: 13 }}
                    onClick={() => sendFriendRequest(u._id)}
                  >
                    Add Friend
                  </button>
                )}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default Profile;
