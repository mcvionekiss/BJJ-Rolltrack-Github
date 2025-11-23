"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Container,
  Paper,
  Box,
  Link,
  CircularProgress,
  AppBar,
  Toolbar,
} from "@mui/material";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");
const CSRF_ENDPOINT = `${API_URL}/auth/csrf/`;
const LOGIN_ENDPOINT = `${API_URL}/auth/login/`;

const fetchCsrfToken = async (setCsrfToken) => {
  try {
    const response = axios.get(CSRF_ENDPOINT, {
      withCredentials: true,
    });
    setCsrfToken(response.data.csrfToken);
  } catch (error) {
    console.error("Failed to fetch CSRF token", error);
  }
};

const loginUser = async (credentials, csrfToken) => {
  return axios.post(LOGIN_ENDPOINT, credentials, {
    withCredentials: true,
    headers: { "X-CSRFToken": csrfToken },
  });
};

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    fetchCsrfToken(setCsrfToken);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (loading) return;
    setLoading(true);

    try {
      const response = await loginUser(
        { email: formData.email, password: formData.password },
        csrfToken
      );
      console.log("Login successful", response.data);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed", err.response?.data || err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/register");
  };

  return (
    <Container maxWidth="xl">
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "white",
          color: "black",
          boxShadow: "none",
          padding: "10px 0",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Image
            src="/logo.jpeg"
            alt="RollTrack Logo"
            width={40}
            height={40}
            style={{ height: "40px", cursor: "pointer" }}
            onClick={() => router.push("/")}
          />

          <Box>
            <Button
              color="inherit"
              onClick={() => router.push("/login")}
              sx={{ textTransform: "none" }}
            >
              Log in
            </Button>
            <Button
              variant="contained"
              onClick={handleSignUp}
              sx={{
                ml: 2,
                backgroundColor: "black",
                color: "white",
                "&:hover": { backgroundColor: "#333" },
              }}
            >
              Sign up
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, textAlign: "center", mt: 5 }}>
          <Typography variant="h5" fontWeight="bold">
            Log in to your account
          </Typography>
          <Typography variant="body2" color="gray" sx={{ mb: 3 }}>
            Welcome back! Please enter your details.
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label="Remember me"
              />
              <Link component={NextLink} href="/forgot" underline="hover">
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                backgroundColor: "black",
                color: "white",
                "&:hover": { backgroundColor: "#333" },
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Don’t have an account?{" "}
            <Link component="button" onClick={handleSignUp} underline="hover">
              Sign up
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Container>
  );
}
