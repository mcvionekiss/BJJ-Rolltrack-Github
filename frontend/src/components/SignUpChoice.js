// src/components/SignUpChoice.js
import React from "react";
import { Button, Typography, Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import GoogleSignUpButton from "./GoogleSignUpButton";
import logo from "../assets/logo.jpeg";

const SignUpChoice = () => {
  const navigate = useNavigate();

  return (
    <Box className="signup-container"
        sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
        }}
    >
        <Box className="logo-bar"
            sx={{
                width: "100%",
                padding: "15px",
            }}
        >
            <img src={logo} alt="RollTrack Logo" className="logo-img" onClick={(e) => {
                            console.log("Navigating to login...");
                            window.location.href = "/"; // Forces full page reload
                        }}/>
        </Box>

        <Box 
            sx={{
                flex: 1, // take remaining height below logo
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start", // align box to top
                pt: 8, // push it down slightly from the top (64px)
              }}
        >
        <Paper elevation={3} className="form-box"
            sx={{
                //padding: "24px",
                textAlign: "center",
                borderRadius: "12px",
                paddingY: "50px",  // top & bottom
                paddingX: "24px",  // left & right   
                width: "fit-content",   
              }}
        >
            <Typography variant="h5" gutterBottom>
            Choose a sign up method
            </Typography>

            <Box mt={6} display="flex" flexDirection="column" gap={2} alignItems="center">
                <Button
                    variant="contained"
                    sx={{
                        width: "300px",
                        height: "40px", // Adjust to match Google's button height visually
                        backgroundColor: "black",
                        color: "white",
                        textTransform: "none", // to match Google's casing
                        fontWeight: 500,
                    }}
                    onClick={() => navigate("/register/email")}
                    >
                    Sign up with Email
                </Button>

                <GoogleSignUpButton redirectToStep={1} />
            </Box>
      </Paper>
      </Box>
    </Box>
  );
};

export default SignUpChoice;