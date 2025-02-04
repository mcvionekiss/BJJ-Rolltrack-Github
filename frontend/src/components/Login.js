import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import for redirection
import axios from "axios";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [csrfToken, setCsrfToken] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // ✅ React Router hook for redirection

    // ✅ Fetch CSRF token when the component mounts
    useEffect(() => {
        axios.get("http://localhost:8000/auth/csrf/", { withCredentials: true })
            .then(response => {
                setCsrfToken(response.data.csrfToken);
            })
            .catch(error => console.error("Failed to fetch CSRF token", error));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:8000/auth/login/",
                { username: email, password },
                {
                    withCredentials: true,  // ✅ Required for session authentication
                    headers: { "X-CSRFToken": csrfToken },  // ✅ Send CSRF token
                }
            );

            console.log("🟢 Login successful", response.data);
            // ✅ Redirect to dashboard after successful login
            navigate("/dashboard");
        } catch (error) {
            console.error("🔴 Login failed", error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6">
            <h3 className="h3">Account Login</h3>
            <p>Login to access your account.</p>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="label">
                        <span>Email</span>
                        <input
                            className="input"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            placeholder="john@doe.com"
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
                            name="password"
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
                    {loading ? "Logging in..." : "Login"}
                </button>
                <a href="/forgot" className="block pt-2 text-center">
                    Forgot Password?
                </a>
            </form>
        </div>
    );
}

export default Login;