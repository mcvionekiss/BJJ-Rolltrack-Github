// src/components/SignUpChoice.js
import React from "react";
import { Container, Button, Typography, Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import GoogleSignUpButton from "./GoogleSignUpButton";
import logo from "../assets/logo.jpeg";
import { AppBar, Toolbar } from "@mui/material";

const SignUpChoice = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
};

  return (
    <Container className="signup-container"
        sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
        }}
    >
        <AppBar position="static" elevation={0} sx={{ background: "white", color: "black", boxShadow: "none", padding: "10px 10px" }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
                {/* Left: Logo Image */}
                <img
                    src={logo}
                    alt="RollTrack Logo"
                    style={{ height: "40px", cursor: "pointer" }}
                    onClick={() => navigate("/")}
                />

                {/* Right: Log in & Sign Up Buttons */}
                <Box>
                    <Button variant="outlined" onClick={handleLogin} sx={{ ml: 2, backgroundColor: "white", color: "black", borderColor: "black", "&:hover": { backgroundColor: "black", color: "white" } }}>
                        Login
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>

        <Box 
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "calc(100vh - 125px)" // Subtract the AppBar height
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
    </Container>
  );
};

export default SignUpChoice;