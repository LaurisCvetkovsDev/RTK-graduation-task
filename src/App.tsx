import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { TimerProvider } from "./contexts/TimerContext";
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
import About from "./components/About";
import "./font/ShareTechMono-Regular.ttf";
import Navbar from "./components/Navbar";
import TopNavigation from "./components/TopNavigation";
import Stopwatch from "./components/Stopwatch";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TimerProvider>
        <Router>
          <div className="background">
            <div className="app app-container">
              <Navbar />
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/reset-password" element={<ResetPasswordForm />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <div className="app-content">
                        <div className="stopwatch-container">
                          <Stopwatch />
                        </div>
                        <div className="main-content-wrapper">
                          <TopNavigation />
                          <div className="main-content-area">
                            <div className="tab-content">
                              <Routes>
                                <Route path="/friends" element={<Friends />} />
                                <Route path="/" element={<Goal />} />
                                <Route path="/stats" element={<Stats />} />
                                <Route path="/about" element={<About />} />
                              </Routes>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </Router>
      </TimerProvider>
    </AuthProvider>
  );
};

export default App;
