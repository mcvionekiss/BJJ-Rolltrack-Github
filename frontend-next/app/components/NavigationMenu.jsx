"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Tooltip,
} from "@mui/material";

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BarChartIcon from "@mui/icons-material/BarChart";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../../public/logo.jpeg";

const MAX_WIDTH = 250;
const MIN_WIDTH = 60;

export default function NavigationMenu({ onWidthChange }) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarWidth, setSidebarWidth] = useState(MAX_WIDTH);
  const animationFrame = useRef(null);

  // Browser-safe resize handler
  const handleResize = useCallback(() => {
    if (typeof window === "undefined") return;

    const screenWidth = window.innerWidth;
    const displayWidth = window.screen.width;

    const newWidth = screenWidth < displayWidth / 2 ? MIN_WIDTH : MAX_WIDTH;

    setSidebarWidth((prev) => (prev !== newWidth ? newWidth : prev));
  }, []);

  // Emit sidebar width to parent
  useEffect(() => {
    onWidthChange?.(sidebarWidth);
  }, [sidebarWidth, onWidthChange]);

  // Setup resize listener (browser only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const resizeListener = () => {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = requestAnimationFrame(handleResize);
    };

    window.addEventListener("resize", resizeListener);

    // Initial run after mount
    animationFrame.current = requestAnimationFrame(handleResize);

    return () => {
      cancelAnimationFrame(animationFrame.current);
      window.removeEventListener("resize", resizeListener);
    };
  }, [handleResize]);

  const toggleWidth = () => {
    setSidebarWidth((prev) => (prev > MIN_WIDTH ? MIN_WIDTH : MAX_WIDTH));
  };

  const menuItems = [
    { text: "Schedule", path: "/dashboard", icon: <CalendarTodayIcon /> },
    { text: "Analytics", path: "/analytics", icon: <BarChartIcon /> },
    { text: "Clients", path: "/clients-page", icon: <PeopleIcon /> },
  ];

  return (
    <Box
      sx={{
        width: `${sidebarWidth}px`,
        height: "100vh",
        backgroundColor: "#f5f5f5",
        boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
        padding: "20px 10px",
        position: "fixed",
        overflowX: "hidden",
        transition: "width 0.3s ease-in-out",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent={sidebarWidth > MIN_WIDTH ? "space-between" : "center"}
        mb={2}
      >
        {sidebarWidth > MIN_WIDTH && (
          <Image
            src={logo}
            alt="RollTrack Logo"
            height={40}
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/")}
          />
        )}

        {sidebarWidth > MIN_WIDTH && (
          <Typography variant="h5" fontWeight="bold">
            Rolltrack
          </Typography>
        )}

        <MenuIcon
          onClick={toggleWidth}
          sx={{ cursor: "pointer", color: "#757575" }}
        />
      </Box>

      <List>
        {menuItems.map((item, index) => (
          <Tooltip title={item.text} placement="right" key={index}>
            <ListItem
              onClick={() => router.push(item.path)}
              sx={{
                mb: 1,
                borderRadius: "8px",
                backgroundColor:
                  pathname === item.path ? "#e0e0e0" : "transparent",
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            >
              <ListItemIcon sx={{ color: "#757575", minWidth: "40px" }}>
                {item.icon}
              </ListItemIcon>

              {sidebarWidth > MIN_WIDTH && <ListItemText primary={item.text} />}
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Box>
  );
}
