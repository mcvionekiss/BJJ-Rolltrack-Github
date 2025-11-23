"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";
import { Box } from "@mui/material";
import NavigationMenu from "../components/NavigationMenu";
import Calendar from "../components/Calendar";

function DashboardScreen() {
  const [sidebarWidth, setSidebarWidth] = useState(250);
  // const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    axios
      .get(API_ENDPOINTS.AUTH.CSRF, { withCredentials: true })
      .then((response) => {
        if (!response.data?.csrfToken) {
          throw new Error("CSRF Token missing in response");
        }
        setCsrfToken(response.data.csrfToken);
      })
      .catch((error) => console.error("Failed to fetch CSRF token", error));
  }, []);

  return (
    <Box display="flex">
      <NavigationMenu onWidthChange={setSidebarWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          transition: "margin-left 0.3s ease-in-out",
          marginLeft: `${sidebarWidth}px`,
        }}
      >
        <Box style={{ marginLeft: "50px", marginRight: "50px" }}>
          <Calendar
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardScreen;
