import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField } from '@mui/material';

export default function AddClass() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = e.target.elements.title.value;
    const date = e.target.elements.date.value;
    const start = `${date}T${e.target.elements.start.value}:00`;
    const end = `${date}T${e.target.elements.end.value}:00`;

    setEvents([
      ...events,
      {
        title,
        start,
        end,
        color: '#E0E0E0',
        textColor: 'black',
        borderColor: 'black',
      },
    ]);

    navigate('/');
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6">Add Class</Typography>
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Class Name" name="title" required margin="normal" />
        <TextField fullWidth type="date" name="date" required margin="normal" />
        <TextField fullWidth type="time" name="start" required margin="normal" />
        <TextField fullWidth type="time" name="end" required margin="normal" />
        <TextField fullWidth label="Instructor" name="instructor" required margin="normal" />
        <TextField fullWidth label="Age" name="age" required margin="normal" />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button type="submit" variant="contained">Save</Button>
          <Button onClick={() => navigate('/')} variant="outlined">Cancel</Button>
        </Box>
      </form>
    </Box>
  );
}
