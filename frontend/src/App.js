import React from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Analytics from "./components/analytics";
import AvailableClasses from "./components/AvailableClasses";
import Checkin from "./components/Checkin";
import CheckinSuccess from "./components/CheckinSuccess";
import ClassDetails from "./components/ClassDetails";
import ClientsPage from "./components/ClientsPage";
import Login from "./components/Login";
import Register from "./components/Register";
import AddClass from "./components/Schedule/AddClass";
import Dashboard from "./components/Schedule/Dashboard";
import { EventProvider } from "./components/Schedule/EventContext";
function App() {
  return (
    <Router>
      <EventProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />{" "}
          {/* Explicit redirect with 'replace' */}
          <Route path="*" element={<Navigate to="/login" replace />} />{" "}
          {/* Catch any undefined routes */}
          {/* Registration Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Gym Owner Pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-class" element={<AddClass />} />
          <Route path="/analytics" element={<Analytics />} />
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
