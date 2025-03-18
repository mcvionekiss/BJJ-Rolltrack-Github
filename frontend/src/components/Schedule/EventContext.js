import { createContext, useContext, useState } from 'react';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([
        {
          title: "Adult Fundamentals",
          color: "#FF5733",
          textColor: "white",
          borderColor: "black",
          rrule: {
           freq: 'weekly',
           byweekday: ['tu','fr']},
        },
        {
          "title": "Adult Advanced",
          "start": "2025-03-12T09:00:00Z",
          "end": "2025-03-12T10:30:00Z",
          "color": "#E0E0E0",
          "textColor": "black",
          "borderColor": "black"
        },
        {
          "title": "Tiny Champs",
          "start": "2025-03-12T10:30:00Z",
          "end": "2025-03-12T11:30:00Z",
          "color": "#76B947",
          "textColor": "white",
          "borderColor": "black"
        },
        {
          "title": "Advanced Teams",
          "start": "2025-03-13T13:00:00Z",
          "end": "2025-03-13T14:30:00Z",
          "color": "#4287f5",
          "textColor": "white",
          "borderColor": "black"
        },
        {
          "title": "Adult Advances",
          "start": "2025-03-14T14:00:00Z",
          "end": "2025-03-14T15:30:00Z",
          "color": "#FFD700",
          "textColor": "black",
          "borderColor": "black"
        },
      ]);
  
  return (
    <EventContext.Provider value={{ events, setEvents }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);
