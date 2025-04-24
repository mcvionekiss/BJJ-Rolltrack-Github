import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Schedule/Dashboard";
import Checkin from "./components/Checkin";
import AvailableClasses from "./components/AvailableClasses";
import ClassDetails from "./components/ClassDetails";
import Analytics from './components/analytics';
import ClientsPage from './components/ClientsPage';
import CheckinSuccess from './components/CheckinSuccess';
import AddClass from "./components/Schedule/AddClass";
import CheckinSelection from "./components/CheckinSelection";
import MemberSignup from "./components/MemberSignup";
import GuestCheckin from "./components/GuestCheckin";
import ProfilePage from "./components/ProfilePage";
import { EventProvider } from "./components/Schedule/EventContext";
import EditClass from "./components/Schedule/EditClass";
import SignUpChoice from "./components/SignUpChoice";
function App() {
    return (
        <Router>
            <EventProvider>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />  {/* 👈 Redirect / to /login */}


                    {/* Registration Pages */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUpChoice />} />
                    <Route path="/register/email" element={<Register />} />
                    <Route path="/register/google" element={<Register />} />

                    {/* Gym Owner Pages */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/add-class" element={<AddClass />} />
                    <Route path="/edit-class" element={<EditClass/>}/>
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/clients-page" element={<ClientsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Check In Flow */}
                    <Route path="/checkin" element={<Checkin />} />
                    <Route path="/checkin-selection" element={<CheckinSelection />} />
                    <Route path="/member-signup" element={<MemberSignup />} />
                    <Route path="/guest-checkin" element={<GuestCheckin />} />
                    <Route path="/available-classes" element={<AvailableClasses />} />
                    <Route path="/class-details/:id" element={<ClassDetails />} />
                    <Route path="/checkin-success" element={<CheckinSuccess />} />
                </Routes>
            </EventProvider>
        </Router>
    );
}

export default App;