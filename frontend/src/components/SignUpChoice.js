// src/components/SignUpChoice.js
import React from "react";
import { Container, Button, Typography, Box, Paper, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import GoogleSignUpButton from "./GoogleSignUpButton";
import logo from "../assets/logo.jpeg";
import { AppBar, Toolbar, Fade } from "@mui/material";

const SignUpChoice = () => {
  const navigate = useNavigate();
  const theme = useTheme();

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
        <AppBar position="static" elevation={0} sx={{ background: "white", color: "black", padding: "10px 10px" }}>
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
                    <Button 
                        variant="outlined" 
                        onClick={handleLogin} 
                        sx={{ 
                            ml: 2, 
                            backgroundColor: "white", 
                            color: "black", 
                            borderColor: "black", 
                            borderRadius: "8px",
                            fontWeight: 500,
                            textTransform: "none",
                            padding: "8px 20px",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": { 
                                backgroundColor: "#f5f5f5", 
                                borderColor: "#333",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)" 
                            } 
                        }}
                    >
                        Login
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>

        <Fade in={true} timeout={800}>
            <Box 
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "calc(100vh - 125px)",
                    position: "relative",
                    zIndex: 1,
                    py: 4
                }}
            >
                <Paper elevation={4} className="form-box"
                    sx={{
                        textAlign: "center",
                        borderRadius: "16px",
                        paddingY: "60px",
                        paddingX: { xs: "24px", sm: "48px" },
                        width: { xs: "90%", sm: "400px" },
                        maxWidth: "500px",
                        background: "linear-gradient(145deg, #ffffff, #f9f9f9)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                        position: "relative",
                        overflow: "hidden",
                        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                        "&:hover": {
                            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
                            transform: "translateY(-5px)"
                        }
                    }}
                >
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            mb: 1, 
                            fontWeight: 700, 
                            letterSpacing: "0.5px",
                            background: "linear-gradient(90deg, #000000, #333333)",
                            backgroundClip: "text",
                            textFillColor: "transparent",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Get Started with RollTrack
                    </Typography>
                    
                    <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                            mb: 2,
                            maxWidth: "280px",
                            mx: "auto",
                            lineHeight: 1.6
                        }}
                    >
                        Choose your preferred sign up method to join our community
                    </Typography>

                    <Box 
                        mt={6} 
                        display="flex" 
                        flexDirection="column" 
                        gap={3} 
                        alignItems="center"
                    >
                        <Button
                            variant="contained"
                            sx={{
                                width: "100%",
                                py: 1.5,
                                backgroundColor: "black",
                                color: "white",
                                textTransform: "none",
                                fontWeight: 500,
                                fontSize: "16px",
                                borderRadius: "10px",
                                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                    backgroundColor: "#222",
                                    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
                                    transform: "translateY(-2px)"
                                }
                            }}
                            onClick={() => navigate("/register/email")}
                        >
                            Sign up with Email
                        </Button>

                        <Box sx={{ position: "relative", width: "100%", my: 1 }}>
                            <Box sx={{ 
                                position: "absolute", 
                                top: "50%", 
                                left: 0, 
                                right: 0, 
                                height: "1px", 
                                bgcolor: "rgba(0,0,0,0.1)" 
                            }} />
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    position: "relative", 
                                    display: "inline-block", 
                                    px: 2, 
                                    bgcolor: "#f9f9f9", 
                                    color: "text.secondary" 
                                }}
                            >
                                or
                            </Typography>
                        </Box>

                        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                            <GoogleSignUpButton redirectToStep={1} />
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Fade>
    </Container>
  );
};

export default SignUpChoice;