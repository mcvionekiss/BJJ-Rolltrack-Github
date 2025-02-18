import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
// import { Calendar } from '@fullcalendar/core'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function Calendar() {


  return (
    <div><FullCalendar
      plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
      initialView="timeGridWeek"
      headerToolbar={{
        start: "timeGridDay,timeGridWeek,dayGridMonth today",
        center: "prev title next",
        end: "addClassButton",
        }}
        customButtons={{
          addClassButton: {
            text: "Add Class",
            click: function () {
              alert("Add Class button clicked!"); // in the works
            },
          },
        }}
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