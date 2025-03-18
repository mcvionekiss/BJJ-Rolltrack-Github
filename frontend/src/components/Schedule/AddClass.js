import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, Select, MenuItem, InputLabel } from '@mui/material';
import NavigationMenu from "../NavigationMenu";
import './Dashboard.css';
import { useEvents } from './EventContext';
import Calendar from './Calendar';

export default function AddClass() {
  const { events, setEvents } = useEvents();

  const navigate = useNavigate();

  const [age, setAge] = React.useState('');
  const handleChange = (event) => {
    setAge(event.target.value);
  };

  const [sidebarWidth, setSidebarWidth] = useState(250);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Collect form data
    const formData = new FormData(e.target);
    const newEvent = {
      title: formData.get("title"),
      start: `${formData.get("date")}T${formData.get("start")}`, // Combine date and time
      end: `${formData.get("date")}T${formData.get("end")}`,
      instructor: formData.get("instructor"),
      description: formData.get("description"),
      age: formData.get("age"),
    };

    // Update events state
    setEvents([...events, newEvent]);

    console.log("New Event Added:", newEvent);

    // Navigate back to dashboard
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
                <Select
                  labelId="age-label"
                  name="age"
                  value={age}  // Controlled component needs value
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value="Adult">Adult</MenuItem>
                  <MenuItem value="Teen">Teen</MenuItem>
                  <MenuItem value="Child">Child</MenuItem>
                </Select>
              </div>
              <Button id="blackButtons" type="submit" variant="contained" style={{ margin: "5px", marginTop: "50px" }}>Save</Button>
              <Button onClick={() => navigate('/dashboard')} variant="outlined" style={{ margin: "5px", marginTop: "50px" }}>Cancel</Button>
            </form >
          </div>
        </Box >
      </Box>
    </Box>
  );
}
