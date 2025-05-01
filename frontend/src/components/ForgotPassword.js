import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Paper, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpeg'; 
import axios from 'axios';
import config from "../config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      // Get CSRF Token
      const csrfRes = await axios.get(config.endpoints.auth.csrf, {
        withCredentials: true,
      });
      const csrfToken = csrfRes.data.csrfToken;
      // Send password reset request
      const res = await axios.post(
        `${config.apiUrl}/auth/request-password-reset/`,
        { email },
        {
          headers: {
            'X-CSRFToken': csrfToken
          },
          withCredentials: true
        }
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <Container maxWidth="xl">
      {/* Top AppBar with logo */}
      <AppBar position="static" elevation={0} sx={{ background: "white", color: "black", boxShadow: "none", padding: "10px 0" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          <img
            src={logo}
            alt="RollTrack Logo"
            style={{ height: "40px", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          />
          <Box /> {/* Empty right side for spacing consistency */}
        </Toolbar>
      </AppBar>

      {/* Centered Forgot Password Form */}
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', mt: 10 }}>
          <Typography variant="h5" fontWeight="bold" mb={1}>
            Forgot your password?
          </Typography>
          <Typography variant="body2" mb={3}>
            No worries! Enter your email and we’ll send you a reset link.
          </Typography>

          <TextField
            fullWidth
            type="email"
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ backgroundColor: 'black', color: 'white', mb: 2 }}
            onClick={handleSubmit}
          >
            Send Reset Link
          </Button>

          {message && (
            <Typography variant="body2" sx={{ color: message.includes("sent") ? "green" : "red" }}>
              {message}
            </Typography>
          )}
        </Paper>
      </Container>
    </Container>
  );
};

export default ForgotPassword;