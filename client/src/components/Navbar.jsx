import { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const navLinks = [
  { to: "/", label: "Feed", end: true },
  { to: "/tasks", label: "Tasks" },
  { to: "/courses", label: "Groups" },
  { to: "/search", label: "Search" },
  { to: "/profile", label: "Profile" },
  { to: "/chat", label: "Chat" },
  { to: "/analytics", label: "Analytics" },
  { to: "/tour", label: "Tour" },
  { to: "/canvas", label: "Canvas" },
  { to: "/jquery", label: "jQuery" },
];

const Navbar = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <header className="site-header">
      <nav className="site-nav">
        <div className="site-nav__brand">
          <Link to="/" className="site-brand">
            <span className="site-brand__icon" aria-hidden="true">
              S
            </span>
            <span className="site-brand__text">
              <span className="site-brand__name">StudyUp</span>
              <span className="site-brand__tagline">Academic Network</span>
            </span>
          </Link>
        </div>

        <div className="site-nav__links">
          {token ? (
            navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `site-nav__link${isActive ? " site-nav__link--active" : ""}`
                }
              >
                {label}
              </NavLink>
            ))
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `site-nav__link${isActive ? " site-nav__link--active" : ""}`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `site-nav__link${isActive ? " site-nav__link--active" : ""}`
                }
              >
                Register
              </NavLink>
            </>
          )}
        </div>

        {token && (
          <div className="site-nav__user">
            <span className="site-nav__user-badge">{initial}</span>
            <span className="site-nav__user-name">{user?.name}</span>
            <button type="button" className="site-nav__logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
