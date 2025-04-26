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
import PasswordChecklist from "react-password-checklist"; // Make sure you installed this
import logo from '../assets/logo.jpeg';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const [confirmPassword, setConfirmPassword] = useState("");
  const [unmetCriteria, setUnmetCriteria] = useState([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const passwordMessages = {
    minLength: "At least 8 characters!",
    specialChar: "At least one special character!",
    number: "At least one number!",
    capital: "At least one uppercase letter!",
  };

  const handleReset = async () => {
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }
    if (unmetCriteria.length > 0) {
      setMessage("Please meet all password requirements.");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:8000/auth/reset-password/${token}/`, {
        password,
      });
      setMessage(res.data.message);

      if (res.data.message && res.data.message.toLowerCase().includes("success")) {
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000); // Wait 2 seconds so user can see "success" message
      }
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
            onClick={(e) => { window.location.href = "/"; }}
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
            onChange={(e) => {
              setPassword(e.target.value);
              if (confirmPassword && e.target.value !== confirmPassword) {
                setConfirmPasswordError("Passwords do not match.");
              } else {
                setConfirmPasswordError("");
              }
            }}
            sx={{ mb: 2 }}
            error={password.length > 0 && unmetCriteria.length > 0}
            helperText={
              password.length > 0 && unmetCriteria.length > 0
                ? `⚠️ ${unmetCriteria.map(rule => passwordMessages[rule]).join(" ")}`
                : ""
            }
          />

          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (password !== e.target.value) {
                setConfirmPasswordError("Passwords do not match.");
              } else {
                setConfirmPasswordError("");
              }
            }}
            sx={{ mb: 2 }}
            error={!!confirmPasswordError}
            helperText={confirmPasswordError}
          />

          {/* Hidden PasswordChecklist for Validation */}
          {password.length > 0 && (
            <PasswordChecklist
              rules={["minLength", "specialChar", "number", "capital"]}
              minLength={8}
              value={password}
              valueAgain={confirmPassword}
              onChange={(isValid, failedRules) => setUnmetCriteria(failedRules)}
              messages={passwordMessages}
              style={{ display: "none" }}
            />
          )}

          <Button
            fullWidth
            variant="contained"
            sx={{ backgroundColor: 'black', color: 'white', mb: 2 }}
            onClick={handleReset}
          >
            Reset Password
          </Button>

          {message && (
            <Typography variant="body2" color={message.includes("success") ? "success.main" : "error.main"}>
              {message}
            </Typography>
          )}
        </Paper>
      </Container>
    </Container>
  );
};

export default ResetPassword;