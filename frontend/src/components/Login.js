import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate(); // React Router for navigation
    const [fields, setFields] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const onSubmit = async (event) => {
        event.preventDefault(); // Prevent form reload
        if (loading) return;
        setLoading(true);

        console.log("🟡 Sending login request with:", fields);

        try {
            const response = await fetch("http://localhost:8000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Ensures cookies are sent
                body: JSON.stringify(fields),
            });

            console.log("🟢 Fetch request sent. Awaiting response...");
            const data = await response.json();
            console.log("🟢 API Response:", data);

            if (data.success) {
                console.log("✅ Token stored in localStorage:", data.access_token);
                localStorage.setItem("token", data.access_token);

                // Redirect to dashboard
                navigate("/dashboard");
            } else {
                console.error("🔴 Login failed:", data);
                alert("Login failed: " + (data.message || "Invalid credentials"));
            }
        } catch (error) {
            console.error("🔴 Fetch error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6">
            <h3 className="h3">Account Login</h3>
            <p>Login to access your account.</p>

            <form onSubmit={onSubmit}>
                <div className="mb-4">
                    <label className="label">
                        <span>Email</span>
                        <input
                            className="input"
                            type="email"
                            name="email"
                            value={fields.email}
                            onChange={(e) => setFields({ ...fields, email: e.target.value })}
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
                            value={fields.password}
                            onChange={(e) => setFields({ ...fields, password: e.target.value })}
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
};

export default Login;