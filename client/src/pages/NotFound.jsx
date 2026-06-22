import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container">
      <div style={styles.wrapper}>
        <div style={styles.badge}>404</div>
        <h2>Page not found</h2>
        <p style={styles.message}>
          The page you are looking for doesn’t exist. Return to your dashboard
          and continue managing your tasks.
        </p>
        <Link to="/" style={styles.homeLink}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    maxWidth: 560,
    margin: "0 auto",
    textAlign: "center",
    padding: "46px 24px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 86,
    height: 86,
    borderRadius: 28,
    background: "#e2e8f0",
    color: "#0f172a",
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 24,
  },
  message: {
    color: "#475569",
    lineHeight: 1.75,
    margin: "16px 0 24px",
  },
  homeLink: {
    display: "inline-block",
    background: "#2563eb",
    color: "#fff",
    borderRadius: 14,
    padding: "12px 24px",
    textDecoration: "none",
    fontWeight: 700,
  },
};

export default NotFound;
