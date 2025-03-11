import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField } from '@mui/material';
import NavigationMenu from "../NavigationMenu";
import './Dashboard.css';
import Calendar from './Calendar';

export default function AddClass({ addEvent }) { // Pass function to update Calendar events
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    title: '',
    date: '',
    start: '',
    end: '',
    instructor: '',
    age: '',
  });
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { title, date, start, end } = eventData;
    const newEvent = {
      title,
      start: `${date}T${start}:00`,
      end: `${date}T${end}:00`,
      color: '#E0E0E0',
      textColor: 'black',
      borderColor: 'black',
    };

    addEvent(newEvent); // Update Calendar events
    navigate('/dashboard');
  };

  return (
    <Box display="flex">
      <NavigationMenu onWidthChange={setSidebarWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          transition: "margin-left 0.3s ease-in-out",
          marginLeft: `${sidebarWidth}px`
        }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <div style={{ margin: "75px" }}>
            <Typography variant="h3" mb={2}>Add Class</Typography>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Class Name</label>
                <TextField fullWidth label="Enter class name" name="title" required margin="normal" />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <label style={{ marginBottom: '4px' }}>Time Start</label>
                    <TextField type="time" name="start" required fullWidth />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <label style={{ marginBottom: '4px' }}>Time End</label>
                    <TextField type="time" name="end" required fullWidth />
                  </Box>
                </Box>
                <label>Date</label>
                <TextField fullWidth type="date" name="date" required margin="normal" />
                <label>Instructor</label>
                <TextField fullWidth label="Enter instructor" name="instructor" required margin="normal" />
                <label>Description</label>
                <TextField fullWidth label="Enter description" name="description" required margin="normal" />
                <label>Age</label>
                <TextField fullWidth label="Age" name="age" required margin="normal" />
              </div>
              <Button id="blackButtons" type="submit" variant="contained" style={{ margin: "5px",  marginTop: "50px" }}>Save</Button>
              <Button onClick={() => navigate('/dashboard')} variant="outlined" style={{ margin: "5px", marginTop: "50px"}}>Cancel</Button>
            </form >
          </div>
        </Box >
      </Box>
    </Box>
  );
}
