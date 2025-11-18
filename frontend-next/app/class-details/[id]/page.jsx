"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import axios from "axios";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  CardMedia,
  Grid,
} from "@mui/material";

// Icons
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

// Utility function to format time to 12-hour format
const formatTime = (time) => {
  const date = new Date(`1970-01-01T${time}Z`);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function ClassDetails() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentEmail = searchParams?.get("email") || "";

  const [classDetails, setClassDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`http://192.168.2.1:8000/api/class_details/${id}/`)
      .then((response) => {
        setClassDetails(response.data);
      })
      .catch(() => {
        setError("Error loading class details.");
      });
  }, [id]);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await axios.post("http://192.168.2.1:8000/api/checkin/", {
        email: studentEmail,
        classID: id,
      });

      const studentName = "John Doe"; // replace with real data if available
      const query = new URLSearchParams({
        studentName,
        className: classDetails?.name || "",
        email: studentEmail,
      }).toString();

      router.push(`/checkin-success?${query}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Error checking in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ paddingBottom: 4 }}>
      {/* Top Image with Back Button */}
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="200"
          image="/banner.png"
          alt="Class Image"
          sx={{
            borderRadius: "0 0 10px 10px",
            filter: "grayscale(100%)",
          }}
        />
        <ArrowBackIosIcon
          onClick={() =>
            router.push(
              `/available-classes${
                studentEmail ? `?email=${encodeURIComponent(studentEmail)}` : ""
              }`
            )
          }
          sx={{
            cursor: "pointer",
            position: "absolute",
            top: 16,
            left: 16,
            color: "black",
          }}
        />
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {classDetails ? (
        <>
          <Typography variant="h4" fontWeight="bold" sx={{ mt: 3 }}>
            {classDetails.name}
          </Typography>

          <Box sx={{ mt: 3, mb: 4 }}>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  TIME:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>
                  {formatTime(classDetails.startTime)} –{" "}
                  {formatTime(classDetails.endTime)}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  DATE:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>
                  {/*{formatDate(classDetails.day)}*/}
                  Wednesday, March 18
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  TRAINER:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>
                  {/*{classDetails.trainer}*/}
                  Alex Martinez
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  CATEGORY:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>
                  {/*{classDetails.category}*/}
                  Fundamentals
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  SKILL LEVEL:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>
                  {/*{classDetails.skillLevel}*/}
                  Intermediate
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  LOCATION:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>Room 1</Typography>
              </Grid>
            </Grid>
          </Box>

          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              borderRadius: "30px",
              backgroundColor: "black",
              color: "white",
              "&:hover": {
                backgroundColor: "#333",
              },
            }}
            onClick={handleCheckIn}
            disabled={loading}
          >
            {loading ? "Checking In..." : "Check In"}
          </Button>
        </>
      ) : (
        <Typography sx={{ mt: 4 }}>Loading...</Typography>
      )}
    </Container>
  );
}
