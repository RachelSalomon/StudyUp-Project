import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import VideoTour from "./pages/VideoTour";
import SketchPad from "./pages/SketchPad";
import JQueryIntegration from "./pages/JQueryIntegration";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/tour" element={<ProtectedRoute><VideoTour /></ProtectedRoute>} />
          <Route path="/canvas" element={<ProtectedRoute><SketchPad /></ProtectedRoute>} />
          <Route path="/jquery" element={<ProtectedRoute><JQueryIntegration /></ProtectedRoute>} />

          <Route path="/dashboard" element={<Navigate to="/tasks" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
