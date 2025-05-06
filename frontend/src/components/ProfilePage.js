import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  Divider,
  Skeleton
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Logout as LogoutIcon
} from "@mui/icons-material";
import NavigationMenu from "./NavigationMenu";
import PersonalInfoForm from "./PersonalInfoForm";
import GymDetailsForm from "./GymDetailsForm";
import config from "../config";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [qrUrl, setQrUrl] = useState(() => {
    return localStorage.getItem("qrUrl") || "";
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    gymName: "", gymPhone: "", gymEmail: "", address: "", city: "", state: ""
  });

  const [profileData, setProfileData] = useState(() => {
    const cached = localStorage.getItem("profileData");
    return cached
      ? JSON.parse(cached)
      : {
          name: "",
          email: "",
          phone: "",
          gym: {
            id: null,
            name: "",
            address: "",
            phone: "",
            email: ""
          }
        };
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/auth/profile/`, {
          withCredentials: true
        });

        const { user, gym } = res.data;
        const newProfile = {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phoneNumber || "",
          gym: {
            id: gym.id,
            name: gym.name,
            address: gym.address || "",
            phone: gym.phone || "",
            email: gym.email || ""
          }
        };
        const qr = config.endpoints.api.generateQR(gym.id);

        // Only update if something changed
        const prev = localStorage.getItem("profileData");
        const prevObj = prev ? JSON.parse(prev) : null;
        const profileChanged = JSON.stringify(newProfile) !== JSON.stringify(prevObj);
        if (profileChanged) {
            setProfileData(newProfile);
            localStorage.setItem("profileData", JSON.stringify(newProfile));
            setQrUrl(qr);
            localStorage.setItem("qrUrl", qr);}
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (editMode && profileData.name) {
      const [firstName, lastName] = profileData.name.split(" ");
      setFormData({
        firstName,
        lastName,
        email: profileData.email,
        phone: profileData.phone,
        gymName: profileData.gym.name || "",
        gymPhone: profileData.gym.phone || "",
        gymEmail: profileData.gym.email || "",
        address: profileData.gym.address || "",
        city: profileData.gym.city || "",
        state: profileData.gym.state || "",
      });
    }
  }, [editMode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem('profileData');
    localStorage.removeItem('qrUrl');
    navigate("/login");
  };

  const handleDownloadQR = async () => {
    if (!qrUrl) return;
    try {
      const response = await fetch(qrUrl, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bjj_rolltrack_qr_${profileData.gym.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download QR code.");
    }
  };

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
  }
  
  const handleSave = async () => {
    try {
      const csrfToken = getCookie("csrftoken");
      // 1. Update user info
      await axios.put(
        `${config.apiUrl}/auth/profile/`,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        },
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
  
      // 2. Create or update gym
      if (!profileData.gym.id) {
        const res = await axios.post(
          `${config.apiUrl}/auth/add-gym/`,
          {
            gymName: formData.gymName,
            gymEmail: formData.gymEmail,
            gymPhoneNumber: formData.gymPhone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
          },
          {
            headers: {
              "X-CSRFToken": csrfToken,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        console.log("✅ Gym created:", res.data.gym);
      } else {
        await axios.put(
          `${config.apiUrl}/auth/gym/${profileData.gym.id}/`,
          {
            gym_name: formData.gymName,
            phone: formData.gymPhone,
            email: formData.gymEmail,
            address: formData.address,
            city: formData.city,
            state: formData.state,
          },
          {
            headers: {
              "X-CSRFToken": csrfToken,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
      }
  
      const res = await axios.get(`${config.apiUrl}/auth/profile/`, {
        withCredentials: true,
      });
  
      const { user, gym } = res.data;
      const updatedProfile = {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phoneNumber || "",
        gym: {
          id: gym.id,
          name: gym.name,
          address: gym.address || "",
          phone: gym.phone || "",
          email: gym.email || "",
          city: gym.city || "",
          state: gym.state || ""
        }
      };
  
      const newQrUrl = config.endpoints.api.generateQR(gym.id);
      setProfileData(updatedProfile);
      setQrUrl(newQrUrl);
      localStorage.setItem("profileData", JSON.stringify(updatedProfile));
      localStorage.setItem("qrUrl", newQrUrl);
  
      setEditMode(false);
      alert("✅ Profile updated successfully!");
  
    } catch (error) {
      console.error("🔴 Failed to update profile:", error);
      alert("Failed to save changes. Please try again.");
    }
  };  

  return (
    <Box display="flex" sx={{ minHeight: "100vh" }}>
      <NavigationMenu onWidthChange={setSidebarWidth} />
      <Box
        sx={{
          flexGrow: 1,
          px: { xs: 1, sm: 3, md: 5 },
          pt: { xs: 2, sm: 3, md: 5 },
          maxWidth: "1400px",
          marginLeft: `${sidebarWidth}px`,
          transition: "margin-left 0.3s ease-in-out",
          height: "100vh",
          overflowY: "auto",
          maxHeight: "calc(100vh - 64px)"
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mt: 0,
            borderRadius: 5,
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.10)"
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4
            }}
          >
            <Typography variant="h4" fontWeight="bold" sx={{ letterSpacing: 1 }}>
              Profile
            </Typography>
            {editMode ? (
                <Box display="flex" gap={2}>
                    <Button
                    variant="outlined"
                    onClick={() => setEditMode(false)}
                    >
                    Cancel
                    </Button>
                    <Button
                    variant="contained"
                    onClick={handleSave} 
                    sx={{
                        backgroundColor: "black",
                        color: "white",
                        "&:hover": { backgroundColor: "#333" }
                    }}
                    >
                    Save Changes
                    </Button>
                </Box>
                ) : (
                <Button
                    variant="outlined"
                    onClick={() => setEditMode(true)}
                >
                    Edit
                </Button>
                )}
          </Box>

          {/* Content */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4
            }}
          >
            {/* Personal Info Card */}
            <Paper
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 4,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: "0 4px 16px 0 rgba(31, 38, 135, 0.08)"
              }}
            >
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Personal Information
              </Typography>
              {!profileData.name ? (
                <>
                  <Skeleton variant="circular" width={100} height={100} />
                  <Skeleton width={160} height={30} sx={{ mt: 2 }} />
                  <Skeleton width={120} height={20} />
                  <Skeleton width="80%" height={20} sx={{ mt: 2 }} />
                  <Skeleton width="80%" height={20} />
                </>
              ) : editMode ? (
                <PersonalInfoForm value={formData} onChange={setFormData} errors={formErrors}/>
              ) : (
                <>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mb: 2,
                      bgcolor: "#e0e7ef",
                      fontSize: 40,
                      color: "#222"
                    }}
                  >
                    {profileData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold">
                    {profileData.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Gym Owner
                  </Typography>
                  <Divider sx={{ width: "100%", mb: 2 }} />
                  <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography>{profileData.email}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography>
                        {profileData.phone || "No phone number provided"}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </Paper>

            {/* Gym Info Card */}
            <Paper
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 4,
                flex: 1,
                boxShadow: "0 4px 16px 0 rgba(31, 38, 135, 0.08)"
              }}
            >
              <Typography variant="h6" fontWeight="bold" mb={3} align="center">
                Gym Information
              </Typography>
              {!profileData.name && !profileData.gym?.id ?  (
                <>
                  <Skeleton width="60%" height={30} />
                  <Skeleton width="90%" height={20} />
                  <Skeleton width="90%" height={20} />
                  <Skeleton width="90%" height={20} />
                  <Skeleton width={180} height={180} sx={{ mt: 3, borderRadius: 2 }} />
                  <Skeleton width="60%" height={36} />
                </>
              ) : editMode ? (
                <GymDetailsForm value={formData} onChange={setFormData} errors={formErrors}/>
              ) : (
                <>
                  <Typography variant="h5" fontWeight="bold" mb={1}>
                    {profileData.gym.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography>{profileData.gym.address}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography>{profileData.gym.phone}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography>{profileData.gym.email}</Typography>
                  </Box>

                  {/* QR Code */}
                  {qrUrl && (
                    <Box
                      sx={{
                        mt: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%"
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 1, color: "#222" }}
                      >
                        Gym Check-in QR Code
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, textAlign: "center", maxWidth: 260 }}
                      >
                        Print and display this QR code at your gym. Members can scan it to check in!
                      </Typography>
                      <img
                        src={qrUrl}
                        alt="Gym QR Code"
                        style={{
                          width: 180,
                          height: 180,
                          marginBottom: 16,
                          border: "3px solid #eee",
                          borderRadius: 12,
                          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                          background: "#fff"
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleDownloadQR}
                        fullWidth
                        sx={{
                          backgroundColor: "black",
                          color: "white",
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: 16,
                          py: 1.2,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                          "&:hover": { backgroundColor: "#333" }
                        }}
                      >
                        Download QR Code
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </Box>
          <Box
            display="flex"
            justifyContent="flex-end"
            sx={{
                mt: 4,
                pr: 5, // adds right padding
            }}
            >
            <Button
                variant="contained"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                backgroundColor: "black",
                color: "white",
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                py: 1.2,
                fontSize: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                "&:hover": { backgroundColor: "#333" }
                }}
            >
                Logout
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ProfilePage;