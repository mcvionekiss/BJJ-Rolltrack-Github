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
        start: "timeGridDay,timeGridWeek,dayGridMonth",
        center: "prev,title,next",
        // end: "prev, "
      }}
      height = {"90vh"}
    />
    </div>
  )
}