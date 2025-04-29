import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import config from "../config";

const GoogleSignIn = () => {
  const navigate = useNavigate();
  const getCsrfToken = async () => {
    try {
      // Use config object for consistent URL patterns
      const res = await axios.get(config.endpoints.auth.csrf, {
        withCredentials: true,
      });
      return res.data.csrfToken;
    } catch (err) {
      console.error("Failed to fetch CSRF token:", err);
      return null;
    }
  };
  
  const handleSuccess = async (credentialResponse) => {
    const id_token = credentialResponse.credential;

    try {
      const csrfToken = await getCsrfToken();
      // Use API_URL from config and append the auth/google path
      const response = await axios.post(`${config.apiUrl}auth/google/`, 
      { id_token },
      {
        withCredentials: true,
        headers: {
          "X-CSRFToken": csrfToken,
        },
      }
    );

      console.log("✅ Logged in:", response.data);
      if (response.data.new_user) {
        // Redirect new users to complete registration
        navigate("/register/google", { state: response.data });
      } else {
        // Redirect existing users to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("❌ Google login error:", err.response?.data || err);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.error("Google login failed")}
    />
  );
};

export default GoogleSignIn;