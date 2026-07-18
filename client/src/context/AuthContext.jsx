import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );

  useEffect(() => {
    axios.defaults.baseURL =
      import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [token, user]);

  const login = async (email, password) => {
    const res = await axios.post("/api/auth/login", { email, password });
    setUser(res.data.data);
    setToken(res.data.data.token);
    return res;
  };

  const register = async (name, email, password, role = "student") => {
    const res = await axios.post("/api/auth/register", {
      name,
      email,
      password,
      role,
    });
    setUser(res.data.data);
    setToken(res.data.data.token);
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
