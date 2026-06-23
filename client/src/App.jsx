import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import NotFound from "./pages/NotFound";

// Corrected paths pointing to the 'pages' directory with exact case matching
import Chat from "./pages/Chat.jsx";
import Analytics from "./pages/Analytics.jsx";
import JqueryAjaxView from "./pages/JQueryIntegration.jsx";

// Checking for remaining files in pages directory
import VideoTour from "./pages/videoTour.jsx";
import SketchPad from "./pages/sketchPad.jsx";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Core Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />

          {/* Advanced Features Protected Routes (Professor Requirements) */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tour"
            element={
              <ProtectedRoute>
                <VideoTour />
              </ProtectedRoute>
            }
          />
          <Route
            path="/canvas"
            element={
              <ProtectedRoute>
                <SketchPad />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jquery"
            element={
              <ProtectedRoute>
                <JqueryAjaxView />
              </ProtectedRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
