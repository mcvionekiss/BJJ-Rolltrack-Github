import React, { useState } from 'react';
import { useNavigate, Routes, Route } from "react-router-dom";
import FullCalendar from '@fullcalendar/react';
import rrulePlugin from '@fullcalendar/rrule'
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEvents } from './EventContext';
import { Box, Modal, Typography, Button, TextField, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
import AddClassInformation from './AddClassInformation';


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
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [age, setAge] = React.useState('');
  const handleChange = (event) => {
    setAge(event.target.value);
  };
  const [repeat, setRepeat] = useState(false);


  // State to control the modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);


  // Handlers for opening and closing the modal
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {setIsModalOpen(false); setSelectedEvent(null);};

  // Event Render Function To Get Event Info and Display it
  function renderEventContent(eventInfo) {
    const { title, start, end, extendedProps } = eventInfo.event;
    const formatTime = (dateStr) => {
      return new Date(dateStr).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    return (
      <div style={{ borderRadius: '5px' }}>
        <strong style={{ fontSize: '12px' }}>{title}</strong>
        {start && end && <p style={{ fontSize: '10px', margin: '2px 0' }}>{formatTime(start)} - {formatTime(end)}</p>}
        {extendedProps.instructor && <p style={{ fontSize: '12px', margin: '2px 0' }}>{extendedProps.instructor}</p>}
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = e.target.elements.title.value;
    const date = e.target.elements.date.value;
    const start = `${date}T${e.target.elements.start.value}:00`;
    const end = `${date}T${e.target.elements.end.value}:00`;
    const instructor = e.target.elements.instructor.value;
    const duration = "01:00:00"; // might not be needed
    const classLevel = e.target.elements.classLevel.value;


    const newEvent = {
      title,
      start,
      end,
      color: '#E0E0E0',
      textColor: 'black',
      borderColor: 'black',
      extendedProps: {
        instructor,
        classLevel,
        duration
      },
    };

    setEvents([...events, newEvent]);
    handleCloseModal();
  }

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
        allDaySlot={false}
        events={events}
        eventContent={renderEventContent}
        eventClick={(info) => {
          setSelectedEvent(info.event); // save clicked event
          setIsModalOpen(true);         // open the modal
        }}
        editable={true}
        selectable={true}
        select={() => {
          setSelectedEvent(null);
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
          {selectedEvent ? (
            <>
              <Typography variant="body2" gutterBottom sx={{ marginBottom: "5%" }}>
                CLASS DETAILS
              </Typography>
              <Typography variant="h6" gutterBottom>
                <strong>{selectedEvent.title}</strong>
              </Typography>
              <Typography variant="body2">
                <strong>Time:</strong> {new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} - {new Date(selectedEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {new Date(selectedEvent.start).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'
                })}
              </Typography>
              <Typography variant="body2">
                <strong>Instructor:</strong> {selectedEvent.extendedProps.instructor}
              </Typography>
              <Typography variant="body2">
                <strong>Total Students:</strong> 20
              </Typography>
              <Typography variant="body2">
                <strong>Level:</strong> {selectedEvent.extendedProps.classLevel}
              </Typography>
              <Button onClick={handleCloseModal} sx={{ mt: 2 }}>Close</Button>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Add Class
              </Typography>
              <AddClassInformation handleSubmit={handleSubmit} handleCancelButton={handleCloseModal} />
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}