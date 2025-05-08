import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const GoogleSignUp = ({ onGoogleData }) => {
  const handleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);

    const googleUser = {
      firstName: decoded.given_name,
      lastName: decoded.family_name,
      email: decoded.email,
    };

    onGoogleData(googleUser); // Pass back to Register.js
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.error("Google Sign-Up Failed")}
    />
  );
};

export default GoogleSignUp;