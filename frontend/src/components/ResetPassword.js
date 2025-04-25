import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Box
} from '@mui/material';
import logo from '../assets/logo.jpeg';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      const res = await axios.post(`http://localhost:8000/auth/reset-password/${token}/`, {
        password,
      });
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
          <Box />
        </Toolbar>
      </AppBar>

      {/* Centered Reset Password Form */}
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', mt: 10 }}>
          <Typography variant="h5" fontWeight="bold" mb={1}>
            Reset your password
          </Typography>
          <Typography variant="body2" mb={3}>
            Enter your new password below.
          </Typography>

          <TextField
            fullWidth
            type="password"
            label="New Password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ backgroundColor: 'black', color: 'white', mb: 2 }}
            onClick={handleReset}
          >
            Reset Password
          </Button>

          {message && (
            <Typography variant="body2" color="error.main">
              {message}
            </Typography>
          )}
        </Paper>
      </Container>
    </Container>
  );
};

export default ResetPassword;