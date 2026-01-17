// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Prime from "./pages/Prime";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import DsaProblems from "./pages/DsaProblems";
import ProblemSolve from "./pages/ProblemSolve";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePictureGuard from "./components/ProfilePictureGuard";
import { useAuthStore } from "./store/authStore";

function App() {
  const { loadUser } = useAuthStore();

  React.useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Router>
      <ProfilePictureGuard>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/prime" element={<Prime />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dsa/problems" element={<DsaProblems />} />
          <Route path="/dsa/problem/:slug" element={<ProblemSolve />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </ProfilePictureGuard>
    </Router>
  );
}

export default App;