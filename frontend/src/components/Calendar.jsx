import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Modal, Typography, Button } from '@mui/material';

export default function Calendar() {
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
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
      title: 'Adult Advances',
      start: '2025-02-20T12:30:00Z',
      end: '2025-02-20T14:20:00Z',
      color: '#E0E0E0',
      textColor: 'black',
      borderColor: 'black',
    },
  ]);

  // State to control the modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handlers for opening and closing the modal
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

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
            click: handleOpenModal,
          },
        }}
        titleFormat={{ year: 'numeric', month: 'long' }}
        height={'95vh'}
      />
      <Modal // in the works, prob not keeping this
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add New Class
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Enter the details for the new class.
          </Typography>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const title = e.target.elements.title.value;
              const start = e.target.elements.start.value;
              const end = e.target.elements.end.value;
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
              <label>Title:</label>
              <input type="text" name="title" required />
            </div>
            <div>
              <label>Start:</label>
              <input type="datetime-local" name="start" required />
            </div>
            <div>
              <label>End:</label>
              <input type="datetime-local" name="end" required />
            </div>
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Add Event
            </Button>
            <Button onClick={handleCloseModal} sx={{ mt: 2 }}>
              Cancel
            </Button>
          </form>
        </Box>
      </Modal>

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
