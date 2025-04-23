import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const GoogleSignIn = () => {
  const navigate = useNavigate();
  const getCsrfToken = async () => {
    const res = await axios.get("http://localhost:8000/auth/csrf/", {
      withCredentials: true,
    });
    return res.data.csrfToken;
  };
  const handleSuccess = async (credentialResponse) => {
    const id_token = credentialResponse.credential;

    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post("http://localhost:8000/auth/google/", 
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