import { createContext, useContext, useState, useEffect } from 'react';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  
  // Default events to use if no saved events exist
  const defaultEvents = [
    // Sample classes with proper formatting
    {
      id: "57771",
      title: "Adult Fundamentals",
      color: "#4caf50", // Green for fundamentals
      textColor: "white",
      borderColor: "#3d8b40",
      start: "2025-04-15T09:00:00",
      end: "2025-04-15T10:00:00",
      rrule: {
        freq: "weekly",
        byweekday: ["tu", "fr"],
      },
      duration: "01:00:00",
      extendedProps: {
        instructor: "John Doe",
        classLevel: "Fundamentals",
        age: "Adult"
      }
    },
    {
      id: "57772",
      title: "Adult Advanced",
      color: "#f44336", // Red for advanced
      textColor: "white",
      borderColor: "#d32f2f",
      start: "2025-04-17T13:00:00",
      end: "2025-04-17T14:30:00",
      rrule: {
        freq: "weekly",
        byweekday: ["th"],
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
      color: "#4caf50", // Green for kids
      textColor: "white",
      borderColor: "#3d8b40",
      start: "2025-04-14T16:00:00",
      end: "2025-04-14T17:00:00",
      rrule: {
        freq: "weekly",
        byweekday: ["mo", "we"],
      },
      duration: "01:00:00",
      extendedProps: {
        instructor: "Coach Ellie",
        classLevel: "Kids",
        age: "Child"
      }
    },
    {
      id: "57773",
      title: "Teens Advanced",
      color: "#2196f3", // Blue for teens
      textColor: "white",
      borderColor: "#1976d2",
      start: "2025-04-16T15:30:00",
      end: "2025-04-16T17:00:00",
      rrule: {
        freq: "weekly",
        byweekday: ["we"],
      },
      duration: "01:30:00",
      extendedProps: {
        instructor: "Coach Mike",
        classLevel: "Elite",
        age: "Teen"
      }
    }
  ];


  //const getclasses = 

  // Load events from localStorage if available
  const [events, setEvents] = useState(//() => {
    /*try {
      const savedEvents = localStorage.getItem('calendarEvents');
      if (savedEvents) {
        console.log("Loading saved events from localStorage");
        return JSON.parse(savedEvents);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    }
    return defaultEvents;
    */
   []
//  }
);

  // Save events to localStorage whenever they change
  useEffect(() => {
    try {
      console.log(`Saving ${events.length} events to localStorage`);
      localStorage.setItem('calendarEvents', JSON.stringify(events));
    } catch (error) {
      console.error("Error saving events:", error);
    }
  }, [events]);

  // Add multiple events at once
  const addEvents = (newEvents) => {
    console.log(`Adding ${newEvents.length} events to calendar`);
    
    // Check for duplicate events before adding
    const eventsThatDontExist = newEvents.filter(newEvent => {
      // For recurring events, check by ID only
      if (newEvent.rrule) {
        const duplicate = events.some(existingEvent => 
          existingEvent.id === newEvent.id || 
          // Check for similar recurrence patterns to avoid duplicates
          (existingEvent.rrule && 
           existingEvent.title === newEvent.title && 
           JSON.stringify(existingEvent.rrule) === JSON.stringify(newEvent.rrule))
        );
        
        if (duplicate) {
          console.log(`Skipping duplicate recurring event: ${newEvent.title}`);
          return false; 
        }
        return true;
      }
      
      // For regular events, check by title and start time
      const duplicate = events.find(existingEvent => {
        // Check if there's an event with the same title and start time
        return (
          existingEvent.title === newEvent.title && 
          existingEvent.start === newEvent.start
        );
      });
      
      if (duplicate) {
        console.log(`Skipping duplicate event: ${newEvent.title} at ${newEvent.start}`);
        return false; // Don't include this event
      }
      
      return true; // Include this event
    });
    
    console.log(`After filtering, adding ${eventsThatDontExist.length} unique events`);
    
    // Only update state if we have non-duplicate events to add
    if (eventsThatDontExist.length > 0) {
      setEvents(current => [...current, ...eventsThatDontExist]);
    }
  };

  // Clear all events and reset to defaults
  const resetEvents = () => {
    console.log("Resetting events to defaults");
    localStorage.removeItem('calendarEvents');
    setEvents(defaultEvents);
  };

  // Clear all data from localStorage
  const clearStorage = () => {
    console.log("Clearing all calendar data from localStorage");
    localStorage.removeItem('calendarEvents');
    setEvents([]);
  };

  return (
    <EventContext.Provider value={{ events, setEvents, addEvents, resetEvents, clearStorage }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);