import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Checkin from "./components/Checkin";
import AvailableClasses from "./components/AvailableClasses";
import ClassDetails from "./components/ClassDetails";
import Analytics from './components/analytics';
import ClientsPage from './components/ClientsPage';
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />  {/* 👈 Redirect / to /login */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/checkin" element={<Checkin />} />
                <Route path="/available-classes" element={<AvailableClasses />} />
                <Route path="/class-details/:id" element={<ClassDetails />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/clients-page" element={<ClientsPage />} />
            </Routes>
        </Router>
    );
}

export default App;