// frontend/src/components/GoogleSignIn.js
import React from "react";
import { GoogleLogin } from "@react-oauth/google";

const GoogleSignIn = () => {
  const handleSuccess = async (credentialResponse) => {
    const accessToken = credentialResponse.credential;

    const res = await fetch("http://localhost:8000/auth/google/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: credentialResponse.credential }),
      credentials: "include"
    });

    const data = await res.json();
    console.log("✅ Google login successful:", data);

    // TODO: Handle session/JWT & redirect user
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log("❌ Google Login Failed")}
      width="100%"
    />
  );
};

export default GoogleSignIn;