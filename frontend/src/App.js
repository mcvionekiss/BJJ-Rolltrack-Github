import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
<<<<<<< Updated upstream
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
import { EventProvider } from "./components/Schedule/EventContext";
=======
import LoginPage from "./pages/Login/LoginPage";
import Register from "./pages/Register/RegisterPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import Checkin from "./pages/Checkin/Checkin";
import AvailableClasses from "./pages/Checkin/AvailableClasses";
import ClassDetails from "./pages/Checkin/ClassDetails";
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import ClientsPage from './pages/Clients/ClientsPage';
import CheckinSuccess from './pages/Checkin/CheckinSuccess';
import AddClass from "./pages/Dashboard/Calendar/AddClass";
import CheckinSelection from "./pages/Checkin/CheckinSelection";
import MemberSignup from "./pages/Checkin/MemberSignup";
import GuestCheckin from "./pages/Checkin/GuestCheckin";
import ProfilePage from "./pages/Profile/ProfilePage";
import { EventProvider } from "./context/EventContext";
import EditClass from "./pages/Dashboard/Calendar/EditClass";
import SignUpChoice from "./pages/Register/SignUpChoice";
import ForgotPassword from "./components/ForgotPassword"
import ResetPassword from "./components/ResetPassword";

>>>>>>> Stashed changes
function App() {
    return (
        <Router>
            <EventProvider>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />  {/* 👈 Redirect / to /login */}


                    {/* Registration Pages */}
<<<<<<< Updated upstream
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
=======
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/signup" element={<SignUpChoice />} />
                    <Route path="/register/email" element={<Register />} />
                    <Route path="/register/google" element={<Register />} />
>>>>>>> Stashed changes

                    {/* Gym Owner Pages */}
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/add-class" element={<AddClass />} />
<<<<<<< Updated upstream
                    <Route path="/analytics" element={<Analytics />} />
=======
                    <Route path="/edit-class" element={<EditClass/>}/>
                    <Route path="/analytics" element={<AnalyticsPage />} />
>>>>>>> Stashed changes
                    <Route path="/clients-page" element={<ClientsPage />} />

                    {/* Check In Flow */}
                    <Route path="/checkin" element={<Checkin />} />
                    <Route path="/available-classes" element={<AvailableClasses />} />
                    <Route path="/class-details/:id" element={<ClassDetails />} />
                    <Route path="/checkin-success" element={<CheckinSuccess />} />
                </Routes>
            </EventProvider>
        </Router>
    );
}

export default App;