"use client";
import DashboardScreen from "./DashboardScreen";
import { EventProvider } from "../contexts/EventContext";

function Dashboard() {
  return (
    <EventProvider>
      <DashboardScreen />
    </EventProvider>
  );
}

export default Dashboard;
