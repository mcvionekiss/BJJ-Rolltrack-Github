import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const fetchCsrfToken = async (setCsrfToken) => {
    try {
        const response = await axios.get("http://localhost:8000/auth/csrf/", { withCredentials: true });
        setCsrfToken(response.data.csrfToken);
    } catch (error) {
        console.error("Failed to fetch CSRF token", error);
    }
};

const loginUser = async (credentials, csrfToken) => {
    return axios.post(
        "http://localhost:8000/auth/login/",
        credentials,
        {
            withCredentials: true, // Required for session authentication
            headers: { "X-CSRFToken": csrfToken }, // Send CSRF token
        }
    );
};

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" }); // ✅ One state for form
    const [csrfToken, setCsrfToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(""); // ✅ Error state
    const navigate = useNavigate();

    // Fetch CSRF token when the component mounts
    useEffect(() => {
        fetchCsrfToken(setCsrfToken);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        try {
            const response = await loginUser({ email: formData.email, password: formData.password }, csrfToken);
            console.log("🟢 Login successful", response.data);
            navigate("/dashboard"); // ✅ Redirect to dashboard
        } catch (error) {
            console.error("🔴 Login failed", error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = () => {
        navigate("/register"); // ✅ Redirects to the Register page
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
                            value={formData.email}
                            onChange={handleChange}
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
                            value={formData.password}
                            onChange={handleChange}
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

            <button
                type="button"
                onClick={handleSignUp}
                disabled={loading}
                className="btn variant-filled-primary w-full font-bold text-white">
                Sign Up
            </button>
        </div>
    );
}

export default Login;