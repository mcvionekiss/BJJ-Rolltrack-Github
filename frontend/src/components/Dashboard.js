import { useNavigate, Outlet, Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

function Dashboard() {
    const navigate = useNavigate();
    const [csrfToken, setCsrfToken] = useState("");

    useEffect(() => {
        axios.get("http://localhost:8000/auth/csrf/", { withCredentials: true })
            .then(response => {
                if (!response.data.csrfToken) {
                    throw new Error("CSRF Token missing in response");
                }
                setCsrfToken(response.data.csrfToken);
            })
            .catch(error => console.error("Failed to fetch CSRF token", error));
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post(
                "http://localhost:8000/auth/logout/",
                {},
                {
                    headers: {"X-CSRFToken": csrfToken},
                    withCredentials: true
                });
            console.log("🟢 Logged out successfully");
            navigate("/login");
        } catch (error) {
            console.error("🔴 Logout failed", error);
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h1>Welcome to the Dashboard</h1>
                <ul>
                    <li>
                        <Link to="/dashboard">Home</Link>
                    </li>
                    <li>
                        <Link to="/available-classes">Available Classes</Link>
                    </li>
                    <li>
                        <Link to="/checkin">Check In</Link>
                    </li>
                    <li>
                        <Link to="/analytics">Analytics</Link>
                    </li>
                    <li>
                        <Link to="/clients-page">Clients Page</Link>
                    </li>
                </ul>
                <button onClick={handleLogout} className="btn variant-filled-primary">
                    Logout
                </button>
            </nav>
            
            <main className="dashboard-content">
                <Outlet /> {/* This is where Analytics will render */}
            </main>
        </div>
    );
}

export default Dashboard;