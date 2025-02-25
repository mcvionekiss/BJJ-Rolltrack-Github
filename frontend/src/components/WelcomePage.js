import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box } from "@mui/material";
import "./WelcomePage.css"; // Create this CSS file for styling

const WelcomePage = () => {
    const navigate = useNavigate();

    return (
            <Box className="welcome-box">
                <Typography variant="h4" className="welcome-title">
                    Welcome to RollTrack!
                </Typography>
                <Typography variant="body1" className="welcome-text">
                    Your account has been successfully created, and you’re all set to start managing your gym.
                </Typography>
                <Button 
                    variant="contained" 
                    sx={{
                        backgroundColor: "black",
                        color: "white",
                        textTransform: "none", // Prevents all caps
                        "&:hover": { backgroundColor: "#333" }
                    }}
                    onClick={() => navigate("/dashboard")}
                >
                    Start
                </Button>
            </Box>
    );
};

export default WelcomePage;