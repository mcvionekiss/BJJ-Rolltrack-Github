"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Container, Typography, Box, Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export default function CheckinSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read values from the query string (Next.js replacement for location.state)
  //   const studentName = searchParams?.get("studentName") || "Student";
  const studentEmail = searchParams?.get("email") || "";
  const className = searchParams?.get("className") || "Class";

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", paddingY: 5 }}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "green" }} />
      </Box>

      <Typography variant="h5" fontWeight="bold">
        You are successfully checkin in for {className}! Have a great workout!
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        What would you like to do next?
      </Typography>

      <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          variant="contained"
          fullWidth
          sx={{
            borderRadius: "30px",
            backgroundColor: "black",
            color: "white",
            "&:hover": { backgroundColor: "#333" },
          }}
          onClick={() =>
            router.push(
              `/available-classes${
                studentEmail ? `?email=${encodeURIComponent(studentEmail)}` : ""
              }`
            )
          }
        >
          Check Into Another Class
        </Button>

        <Button
          variant="outlined"
          fullWidth
          sx={{
            borderRadius: "30px",
            borderColor: "black",
            color: "black",
            "&:hover": { backgroundColor: "black", color: "white" },
          }}
          onClick={() => router.push("/checkin")}
        >
          Done
        </Button>
      </Box>
    </Container>
  );
}
