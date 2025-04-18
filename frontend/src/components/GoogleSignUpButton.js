import React from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Optional
import { GoogleLogin } from "@react-oauth/google";

const GoogleSignUpButton = () => {
  const getCsrfToken = async () => {
    const res = await axios.get("http://localhost:8000/auth/csrf/", {
      withCredentials: true,
    });
    return res.data.csrfToken;
  };

  const handleSuccess = async (credentialResponse) => {
    const id_token = credentialResponse.credential;
    const csrfToken = await getCsrfToken();

    try {
      const res = await axios.post(
        "http://localhost:8000/auth/google/",
        { id_token },
        {
        headers: {
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true,
        }
      );
      console.log("✅ Google signup success:", res.data);

      // Save token & user info (optional: decode it if needed)
      localStorage.setItem("authToken", res.data.token);

      // Optionally decode the token to extract name/email
      const decoded = jwtDecode(id_token);
      localStorage.setItem("userInfo", JSON.stringify({
        first_name: decoded.given_name || "",
        last_name: decoded.family_name || "",
        email: decoded.email || "",
      }));

      // 👇 Redirect into stepper flow at step 1
      window.location.href = "/register/google";

    } catch (err) {
      console.error("❌ Google signup failed:", err.response?.data || err);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.error("Google sign-up failed")}
      ux_mode="popup"
      useOneTap={false}
      text="signup_with"
      theme="outline"
      width="300"
    />
  );
};

export default GoogleSignUpButton;
