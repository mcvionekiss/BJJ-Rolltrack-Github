import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />  {/* 👈 Redirect / to /login */}
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<h1>Welcome to the Dashboard</h1>} />
            </Routes>
        </Router>
    );
}

export default App;