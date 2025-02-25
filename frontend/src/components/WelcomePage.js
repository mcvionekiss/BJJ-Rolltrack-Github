import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Paper } from "@mui/material";
import "./WelcomePage.css"; // Create this CSS file for styling

const WelcomePage = () => {
    const navigate = useNavigate();

    return (
            <Paper elevation={0} className="welcome-box">
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
                        "&:hover": { backgroundColor: "#333" }
                    }}
                    onClick={() => navigate("/dashboard")}
                >
                    Start
                </Button>
            </Paper>
    );
};

export default WelcomePage;