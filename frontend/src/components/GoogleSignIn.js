import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const GoogleSignIn = () => {
  const handleSuccess = async (credentialResponse) => {
    const id_token = credentialResponse.credential;

    try {
      const response = await axios.post("http://localhost:8000/auth/google/", {
        id_token,
      }, { withCredentials: true });

      console.log("✅ Logged in:", response.data);
      localStorage.setItem("authToken", response.data.token);
      window.location.href = "/dashboard";
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