import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog } from '@base-ui-components/react/dialog';

export default function Calendar() {
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

  // Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function AddClassDialog() {
    return (
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal keepMounted>
          <Dialog.Backdrop />
          <Dialog.Popup>
            <Dialog.Title>Add Class</Dialog.Title>
            <Dialog.Description>
              Enter the details for the new class.
            </Dialog.Description>
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
                setIsDialogOpen(false);
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
              <button type="submit">Add Event</button>
              <Dialog.Close>Cancel</Dialog.Close>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

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
            click: function () {
              setIsDialogOpen(true);
            },
          },
        }}
        titleFormat={{ year: 'numeric', month: 'long' }}
        height={'95vh'}
      />
      <AddClassDialog />
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
