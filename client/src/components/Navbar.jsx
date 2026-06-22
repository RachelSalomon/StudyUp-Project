import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <div style={styles.brandSection}>
          <Link to="/" style={styles.brand}>
            StudyUp
          </Link>
        </div>

        <div style={styles.linkSection}>
          {token ? (
            <>
              <Link to="/" style={styles.link}>
                Dashboard
              </Link>
              <Link to="/courses" style={styles.link}>
                Courses
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>
                Login
              </Link>
              <Link to="/register" style={styles.link}>
                Register
              </Link>
            </>
          )}
        </div>

        {token && (
          <div style={styles.userSection}>
            <span style={styles.userText}>Logged in as {user?.name}</span>
            <button
              type="button"
              style={styles.logoutButton}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

const styles = {
  header: {
    width: "100%",
    background: "#0f172a",
    padding: "16px 24px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
  },
  nav: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    color: "#f8fafc",
    flexWrap: "wrap",
  },
  brandSection: {
    flex: "1 1 auto",
  },
  brand: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: 700,
    textDecoration: "none",
  },
  linkSection: {
    display: "flex",
    gap: 16,
    flex: "1 1 auto",
    justifyContent: "center",
  },
  link: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: 15,
    fontWeight: 500,
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: "1 1 auto",
    justifyContent: "flex-end",
  },
  userText: {
    color: "#e2e8f0",
    fontSize: 14,
  },
  logoutButton: {
    background: "#38bdf8",
    border: "none",
    borderRadius: 8,
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: 700,
    padding: "10px 16px",
  },
};

export default Navbar;
