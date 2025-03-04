import React, { useState } from 'react';
import { useNavigate, Routes, Route } from "react-router-dom";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Modal, Typography, Button, TextField } from '@mui/material';
import '../Calendar.css';
import AddClass from './AddClass';

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

  const [events, setEvents] = useState([
    {
      title: 'Adult Fundamentals',
      start: '2025-02-20T10:00:00Z',
      end: '2025-02-20T12:00:00Z',
      color: '#E0E0E0',
      textColor: 'black',
      borderColor: 'black',
    },
    {
      title: 'Adult Advanced',
      start: '2025-02-20T12:30:00Z',
      end: '2025-02-20T14:20:00Z',
      color: '#E0E0E0',
      textColor: 'black',
      borderColor: 'black',
    },
  ]);

  // State to control the modal visibility
  // const [isModalOpen, setIsModalOpen] = useState(false);

  // Handlers for opening and closing the modal
  // const handleOpenModal = () => setIsModalOpen(true);
  // const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          start: 'timeGridDay,timeGridWeek,dayGridMonth today',
          center: 'prev title next',
          end: 'addClassButton',
        }}
        events={events}
        customButtons={{
          addClassButton: {
            text: 'Add Class',
            click: () => navigate('/add-class'),
          },
        }}
        titleFormat={{ year: 'numeric', month: 'long' }}
        height={'95vh'}
      />
      {/* <Modal
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
              <label>Time Start</label>
              <TextField fullWidth type="time" name="start" required margin="normal" />
              <label>Time End</label>
              <TextField fullWidth type="time" name="end" required margin="normal" />
              <label>Date</label>
              <TextField fullWidth type="date" name="date" required margin="normal" />
              <label>Instructor</label>
              <TextField fullWidth label="Instructor" name="instructor" required margin="normal" />
              <label>Age</label>
              <TextField fullWidth label="Age" name="age" required margin="normal" /> 
              </div>
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Save
            </Button>
            <Button onClick={handleCloseModal} sx={{ mt: 2 }}>
              Cancel
            </Button>
          </form>
        </Box>
      </Modal> */}

      <style>
        {`
          .fc-toolbar.fc-header-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: nowrap;
          }
          
          .fc-toolbar-chunk {
            display: flex !important;
            align-items: center !important;
            gap: 10px;
          }
        `}
      </style>
    </div>
  );
}
