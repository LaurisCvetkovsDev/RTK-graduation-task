import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import ResetPasswordForm from "./components/Auth/ResetPasswordForm";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Friends from "./components/Friends";
import Goal from "./components/Goal";
import Stats from "./components/Stats";
import "./font/ShareTechMono-Regular.ttf";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import TopNavigation from "./components/TopNavigation";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="background">
          <div className="app app-container">
            <Navbar />
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route
                path="/reset-password"
                element={
                  <ProtectedRoute>
                    <ResetPasswordForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <main className="main-content">
                      <div className="timer-section">
                        <Sidebar />
                      </div>
                      <div className="content-section">
                        <TopNavigation />
                        <div className="tabs-section">
                          <Routes>
                            <Route path="/friends" element={<Friends />} />
                            <Route index element={<Goal />} />
                            <Route path="/stats" element={<Stats />} />
                          </Routes>
                        </div>
                      </div>
                    </main>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
