import { useState } from 'react';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
// import { Calendar } from '@fullcalendar/core'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function Calendar() {
  const [events, setEvents] = useState([
    {
      title: 'Adult Fundamentals',
      start: '2025-02-20T10:00:00Z',
      end: '2025-02-20T12:00:00Z',
      color: '#E0E0E0',
      textColor: 'black',
      borderColor: 'black'
    },
    {
      title: 'Adult Advances',
      start: '2025-02-20T12:30:00Z',
      end: '2025-02-20T14:20:00Z',
      color: '#E0E0E0',
      textColor: 'black',
      borderColor: 'black'
    },
  ]);

  // const handleDateClick = (arg) => {
  //   const title = prompt('Enter Event Title:');
  //   if (title) {
  //     setEvents([
  //       ...events,
  //       {
  //         title,
  //         start: arg.dateStr,
  //         end: arg.dateStr,
  //       },
  //     ]);
  //   }
  // };

  return (
    <div><FullCalendar
      plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
      initialView="timeGridWeek"
      headerToolbar={{
        start: "timeGridDay,timeGridWeek,dayGridMonth today",
        center: "prev title next",
        end: "addClassButton",
        }}
        events={events}
        customButtons={{
          addClassButton: {
            text: 'Add Class',
            click: function () {
              alert('Add Class button clicked!'); // in the works
            },
          },
        }}
        // dateClick={handleDateClick}
        titleFormat={{ year: "numeric", month: "long" }}
      height = {"90vh"}
    />
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
  )
}