import { createContext, useContext, useState } from 'react';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([
        {
            title: "Adult Fundamentals",
            color: "#E0E0E0",
            textColor: "black",
            borderColor: "black",
            rrule: {
              freq: "weekly",
              byweekday: ["tu", "fr"],
              dtstart: "2025-03-12T08:00:00Z",
            },
            duration: "01:00:00",
          },
          {
            title: "Adult Advanced",
            color: "#E0E0E0",
            textColor: "black",
            borderColor: "black",
            rrule: {
              freq: "weekly",
              byweekday: ["we"],
              dtstart: "2025-03-12T09:00:00Z",
            },
            duration: "01:30:00",
          },
          {
            title: "Tiny Champs",
            color: "#E0E0E0",
            textColor: "black",
            borderColor: "black",
            rrule: {
              freq: "weekly",
              byweekday: ["we"],
              dtstart: "2025-03-12T10:30:00Z",
            },
            duration: "01:00:00",
          },
          {
            title: "Advanced Teams",
            color: "#E0E0E0",
            textColor: "black",
            borderColor: "black",
            rrule: {
              freq: "weekly",
              byweekday: ["th"],
              dtstart: "2025-03-13T13:00:00Z",
            },
            duration: "01:30:00",
          },
          {
            title: "Adult Advanced",
            color: "#E0E0E0",
            textColor: "black",
            borderColor: "black",
            rrule: {
              freq: "weekly",
              byweekday: ["fr"],
              dtstart: "2025-03-14T14:00:00Z",
            },
            duration: "01:30:00",
          },
      ]);
  
  return (
    <EventContext.Provider value={{ events, setEvents }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);
