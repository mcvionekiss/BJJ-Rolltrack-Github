import { createContext, useContext, useState } from 'react';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([
      // sample classes
        {
          id: "57771",
          title: "Adult Fundamentals",
          color: "#E0E0E0",
          textColor: "black",
          borderColor: "black",
          rrule: {
            freq: "weekly",
            byweekday: ["tu", "fr"],
            dtstart: "2025-03-11T15:00:00Z",
          },
          duration: "01:00:00",
          extendedProps: {
            instructor: "John Doe",
            classLevel: "Beginner",
            age: "Adult"
          }
        },
        {
          id: "57772",
          title: "Adult Advanced",
          color: "#E0E0E0",
          textColor: "black",
          borderColor: "black",
          rrule: {
            freq: "weekly",
            byweekday: ["we"],
            dtstart: "2025-03-12T20:00:00Z",
          },
          duration: "01:30:00",
          extendedProps: {
            instructor: "Jane Smith",
            classLevel: "Advanced",
            age: "Adult"
          }
        },
        {
          id: "57773",
          title: "Tiny Champs",
          color: "#E0E0E0",
          textColor: "black",
          borderColor: "black",
          rrule: {
            freq: "weekly",
            byweekday: ["we"],
            dtstart: "2025-03-12T17:00:00Z",
          },
          duration: "01:00:00",
          extendedProps: {
            instructor: "Coach Ellie",
            classLevel: "Kids",
            age: "Child"
          }
        },
        {
          id: "57774",
          title: "Teens Advanced",
          color: "#E0E0E0",
          textColor: "black",
          borderColor: "black",
          rrule: {
            freq: "weekly",
            byweekday: ["th"],
            dtstart: "2025-03-13T17:00:00Z",
          },
          duration: "01:30:00",
          extendedProps: {
            instructor: "Coach Mike",
            classLevel: "Elite",
            age: "Teen"
          }
        },
        {
          id: "57775",
          title: "Adult Advanced",
          color: "#E0E0E0",
          textColor: "black",
          borderColor: "black",
          rrule: {
            freq: "weekly",
            byweekday: ["fr"],
            dtstart: "2025-03-14T19:00:00Z",
          },
          duration: "01:30:00",
          extendedProps: {
            instructor: "Jane Smith",
            classLevel: "Advanced",
            age: "Adult"
          }
        }     
      ]);
  
  return (
    <EventContext.Provider value={{ events, setEvents }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);