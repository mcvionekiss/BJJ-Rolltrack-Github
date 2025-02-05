import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [csrfToken, setCsrfToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // ✅ Fetch CSRF token when the component mounts
    useEffect(() => {
        axios.get("http://localhost:8000/auth/csrf/", { withCredentials: true })
            .then(response => setCsrfToken(response.data.csrfToken))
            .catch(error => console.error("Failed to fetch CSRF token", error));
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError(null);  // Reset error state before new request

        try {
            const response = await axios.post(
                "http://localhost:8000/auth/register/",
                { username, email, password },
                {
                    withCredentials: true,  // ✅ Required for session authentication
                    headers: { "X-CSRFToken": csrfToken },  // ✅ Send CSRF token
                }
            );

            console.log("🟢 Registration successful", response.data);

            // ✅ Redirect to the dashboard after successful registration
            navigate("/dashboard");

        } catch (error) {
            setError(error.response?.data?.message || "Registration failed");
            console.error("🔴 Registration failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6">
            <h3 className="h3">Create an Account</h3>
            <p>Register to start using the platform.</p>

            {error && <p className="text-red-500">{error}</p>} {/* ✅ Show error message if registration fails */}

            <form onSubmit={handleRegister}>
                <div className="mb-4">
                    <label className="label">
                        <span>Username</span>
                        <input
                            className="input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            placeholder="Choose a username"
                            required
                        />
                    </label>
                </div>

                <div className="mb-4">
                    <label className="label">
                        <span>Email</span>
                        <input
                            className="input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            placeholder="you@example.com"
                            required
                        />
                    </label>
                </div>

                <div className="mb-6">
                    <label className="label">
                        <span>Password</span>
                        <input
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn variant-filled-primary w-full font-bold text-white"
                >
                    {loading ? "Registering..." : "Register"}
                </button>
                <p className="text-center mt-2">
                    Already have an account? <a href="/login" className="text-blue-500">Login here</a>.
                </p>
            </form>
        </div>
    );
}

export default Register;