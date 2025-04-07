import React, { useState } from 'react';
import { useNavigate, Routes, Route } from "react-router-dom";
import FullCalendar from '@fullcalendar/react';
import rrulePlugin from '@fullcalendar/rrule'
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEvents } from './EventContext';
import { Box, Modal, Typography, Button, TextField, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';


export default function Calendar() {
  const navigate = useNavigate();
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: '20px'
  };

  const { events, setEvents } = useEvents();

  const [age, setAge] = React.useState('');
  const handleChange = (event) => {
    setAge(event.target.value);
  };
  const [repeat, setRepeat] = useState(false);


  // State to control the modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);


  // Handlers for opening and closing the modal
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);


  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          start: 'timeGridDay,timeGridWeek,dayGridMonth today',
          center: 'prev title next',
          end: 'addClassButton',
        }}
        events={events}
        selectable={true}
        select={() => {
          handleOpenModal();
        }}
        customButtons={{
          addClassButton: {
            text: 'Add Class',
            click: () => navigate('/add-class'),
          },
        }}
        titleFormat={{ year: 'numeric', month: 'long' }}
        height={'95vh'}
      />
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" style={{ marginBottom: '20px' }}>
            Add Class
          </Typography>
          <form
            onSubmit={(e) => {
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
              handleCloseModal();
            }}
          >
            <div>
              <label>Class Name</label>
              <TextField fullWidth label="Class Name" name="title" required margin="normal" />
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
              <TextField fullWidth label="Instructor" name="instructor" required margin="normal" />
              <label>Class Level</label>
              <TextField fullWidth label="Class Level" name="classLevel" required margin="normal" />
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
              {/* <Box>
                <FormControlLabel control={<Switch />} label="Repeat" />
                </Box> */}
            </div>
            <Button type="submit" variant="contained" sx={{ mt: 2, backgroundColor: "black" }}>
              Save
            </Button>
            <Button onClick={handleCloseModal} sx={{ mt: 2 }}>
              Cancel
            </Button>
          </form>
        </Box>
      </Modal>
    </div>
  );
}