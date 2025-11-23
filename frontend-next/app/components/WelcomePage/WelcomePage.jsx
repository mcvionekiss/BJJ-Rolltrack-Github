"use client";

import { useRouter } from "next/navigation";
import { Button, Typography, Box } from "@mui/material";
import styles from "./WelcomePage.module.css";

const WelcomePage = () => {
  const router = useRouter();

  return (
    <Box className={styles["welcome-box"]}>
      <Typography variant="h4" className={styles["welcome-title"]}>
        Welcome to RollTrack!
      </Typography>
      <Typography variant="body1" className={styles["welcome-text"]}>
        Your account has been successfully created, and you’re all set to start
        managing your gym.
      </Typography>
      <Button
        className={styles["start-button"]}
        variant="contained"
        sx={{
          backgroundColor: "black",
          color: "white",
          textTransform: "none",
          "&:hover": { backgroundColor: "#333" },
        }}
        onClick={() => router.push("/dashboard")}
      >
        Start
      </Button>
    </Box>
  );
};

export default WelcomePage;
