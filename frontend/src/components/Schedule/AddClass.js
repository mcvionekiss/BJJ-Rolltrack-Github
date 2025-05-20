import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, Select, MenuItem, InputLabel } from '@mui/material';
import NavigationMenu from "../NavigationMenu";
import './Dashboard.css';
import { useEvents } from './EventContext';
import Calendar from './Calendar';
import AddClassInformation from './AddClassInformation';
import { v4 as uuidv4 } from 'uuid';

import axios from "axios";
import config from "../../config";

const fetchCsrfToken = async (setCsrfToken) => {
  try {
      const response = await axios.get(config.endpoints.auth.csrf, {
          withCredentials: true,
      });
      setCsrfToken(response.data.csrfToken);
  } catch (error) {
      console.error("Failed to fetch CSRF token", error);
  }
};

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
}

const postdata = async (posting_data) => {
  const csrfToken = getCookie('csrftoken');
    axios.post(
        config.endpoints.api.addClasses,
        posting_data,
        {
          headers: {
            "X-CSRFToken": csrfToken,
          },
            withCredentials: true, // Required for session authentication
        }
    );
};

const getdata = async (gym_id) => {
  const csrfToken = getCookie('csrftoken');
    return axios.post(
        config.endpoints.api.getClasses,
        {"gym_id" : gym_id},
        {
          headers: {
            "X-CSRFToken": csrfToken,
          },
            withCredentials: true, // Required for session authentication
        }
    );
};
  const getEvents = async () => {
    try {
    let cached = localStorage.getItem("profileData");
    cached = JSON.parse(cached);
    const response = await getdata(cached.gym.id);

    const classes = response.data.classes;
    console.log(classes)
    const newEvents = [];

    classes.forEach(scheduled_class => {
      //console.log(scheduled_class)
        const newEvent = {
          "id": scheduled_class.id,
          "title": scheduled_class.name,
          "date" : scheduled_class.date,
          "start": new Date(scheduled_class.date+'T'+scheduled_class.start_time),
          "end": new Date(scheduled_class.date+'T'+scheduled_class.end_time),
          "parent_reccur" : scheduled_class.parent_reccur_id,
          "is_recurring" : scheduled_class.is_recurring,
          "color" : scheduled_class.color,
          "textColor" : 'white',
          extendedProps: {
            "instructor" : "",
            "classLevel" : scheduled_class.level,
            "age": "",
            "duration": scheduled_class.duration,
            dayOfWeek: scheduled_class.is_recurring,
            //capacity: capacity
          }
        };
        

        newEvents.push(newEvent);
        //console.log(newEvent)
    });
    return newEvents
      
    } catch (error) {
      console.log(error)
    }
  }

export default function AddClass() {
  const { events, setEvents } = useEvents();
  const navigate = useNavigate();
  const [sidebarWidth, setSidebarWidth] = useState(250);

  const [loading, setLoading] = useState(false)
  const [qrUrl, setQrUrl] = useState(() => {
    return localStorage.getItem("qrUrl") || "";
  });

  const [profileData, setProfileData] = useState(() => {
    const cached = localStorage.getItem("profileData");
    return cached
      ? JSON.parse(cached)
      : {
          name: "",
          email: "",
          phone: "",
          gym: {
            id: null,
            name: "",
            address: "",
            phone: "",
            email: ""
          }
        };
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/auth/profile/`, {
          withCredentials: true
        });

        const { user, gym } = res.data;
        const newProfile = {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phoneNumber || "",
          gym: {
            id: gym.id,
            name: gym.name,
            address: gym.address || "",
            phone: gym.phone || "",
            email: gym.email || ""
          }
        };
        const qr = config.endpoints.api.generateQR(gym.id);

        // Only update if something changed
        const prev = localStorage.getItem("profileData");
        const prevObj = prev ? JSON.parse(prev) : null;
        const profileChanged = JSON.stringify(newProfile) !== JSON.stringify(prevObj);
        if (profileChanged) {
            setProfileData(newProfile);
            localStorage.setItem("profileData", JSON.stringify(newProfile));
            //setQrUrl(qr);
            localStorage.setItem("qrUrl", qr);}
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        navigate("/login");
      } 
    };


    const getEvents = async () => {
      try {
        let cached = localStorage.getItem("profileData");
        cached = JSON.parse(cached);
        const response = await getdata(profileData.gym.id);
        console.log("hey")

        const classes = response.data.classes;
        const newEvents = [];

        classes.forEach(scheduled_class => {
          //console.log(scheduled_class)
          console.log(scheduled_class.is_recurring, typeof(scheduled_class.is_recurring))
            const newEvent = {
              "id": scheduled_class.id,
              "title": scheduled_class.name,
              "date" : scheduled_class.date,
              "start": new Date(scheduled_class.date+'T'+scheduled_class.start_time),
              "end": new Date(scheduled_class.date+'T'+scheduled_class.end_time),
              "parent_reccur" : scheduled_class.parent_reccur_id,
              "is_recurring" : scheduled_class.is_recurring,
              "color" : scheduled_class.color,
              "textColor" : 'white',
              extendedProps: {
                "instructor" : "",
                "classLevel" : scheduled_class.level,
                "age": "",
                "duration": scheduled_class.duration,
                //dayOfWeek: dayName,
                capacity: scheduled_class.capacity
              }
            };
            
            newEvents.push(newEvent);
            //console.log(newEvent)
        });
        setEvents(newEvents)
          
        } catch (error) {
          console.log(error)
        }
      };

    fetchProfile();
    getEvents();
  }, []);

  // Color helper function
  const getLevelColor = (level) => {
    if (!level) return '#3788d8';

    
    const levelLower = level.toLowerCase();
    if (levelLower.includes('beginner') || levelLower.includes('fundamentals')) return '#4caf50';
    if (levelLower.includes('intermediate')) return '#ff9800';
    if (levelLower.includes('advanced')) return '#f44336';
    return '#3788d8'; // default blue
  };


  // NEW Version of handleSubmit with completely different approach
  const handleSubmit = async (e, recurrence) => {
    e.preventDefault();
    console.log("=== NEW FORM HANDLER STARTED ===");
    console.log("recurrence", recurrence)
    
    // Extract all form data
    const form = e.target;
    const title = form.elements.title.value;
    const date = form.elements.date.value; 
    const startTime = form.elements.start.value;
    const endTime = form.elements.end.value;
    const instructor = form.elements.instructor.value;
    const classLevel = form.elements.classLevel.value;
    const ageGroup = form.elements.age.value;
    const id = uuidv4();
    
    // Get color based on class level
    const color = getLevelColor(classLevel);
    
    // Get the date object for the selected date
    const baseDate = new Date(date + "T00:00:00");
    const baseDayIndex = baseDate.getDay(); // 0=Sunday, 1=Monday, etc.
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const baseDayName = dayNames[baseDayIndex];
    
    console.log(`Base date is ${baseDate.toDateString()} (${baseDayName})`);
    
    // Array to hold all new events
    const newEvents = [];

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const diffMs = endDate - startDate;
    const class_duration = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    
    // If this is a recurring event and is weekly
    if (recurrence && recurrence.type === 'weekly') {
      console.log("Creating weekly recurring events");
      console.log("Selected days:", recurrence.days);
      
      // Debug which days are selected 
      let selectedDayCount = 0;
      dayNames.forEach(day => {
        if (recurrence.days[day]) {
          console.log(`- ${day} is selected`);
          selectedDayCount++;
        }
      });
      console.log(`Total selected days: ${selectedDayCount}`);
      
      // Process each day of the week
      dayNames.forEach((dayName, dayIndex) => {
        // Skip if this day is not selected
        if (!recurrence.days[dayName]) {
          return;
        }
        
        console.log(`Processing day: ${dayName} (day ${dayIndex})`);
        
        // Calculate date for this day
        const dayDiff = calculateDayDifference(baseDayIndex, dayIndex);
        console.log(`Day difference: ${dayDiff} days`);
        
        // Clone the base date
        const eventDate = new Date(baseDate);
        
        // Adjust to the target day
        eventDate.setDate(eventDate.getDate() + dayDiff);
        
        // Format as YYYY-MM-DD
        const formattedDate = formatDate(eventDate);
        console.log(`Event date: ${formattedDate} (${eventDate.toDateString()})`);
        
        // Create a unique ID
        const eventId = `class-${Date.now()}-${dayName}`;
        
        // Create the event
        const newEvent = {
          id: eventId,
          title,
          start: `${formattedDate}T${startTime}`,
          end: `${formattedDate}T${endTime}`,
          color,
          textColor: 'white',
          extendedProps: {
            instructor,
            classLevel,
            age: ageGroup,
            duration: calculateDuration(startTime, endTime),
            dayOfWeek: dayName
          }
        };
        
        // Add to our collection
//        newEvents.push(newEvent);
        console.log(`Created event for ${dayName} on ${formattedDate}`);
      });
      console.log("recurrence", recurrence)
        const postingData = {
            "gym_id" : profileData.gym.id,
            "name" : form.elements.title.value,
            "date" : date,
            "start_time" : startTime,
            "end_time" : endTime,
            "is_canceled" : false,
            "is_recurring" : true,
            "recurrs_Monday" : recurrence.days.monday,
            "recurrs_Tuesday" : recurrence.days.tuesday,
            "recurrs_Wednesday" : recurrence.days.wednesday,
            "recurrs_Thursday" : recurrence.days.thursday,
            "recurrs_Friday" : recurrence.days.friday,
            "recurrs_Saturday" : recurrence.days.saturday,
            "recurrs_Sunday" : recurrence.days.sunday,
            "duration" : class_duration,
            "level" : classLevel,
            "capacity" : 20,
            "notes" : "test",
            "template" : 1
        }
            try {
              //console.log(postingData)
              await postdata(postingData)
            } catch (error) {
                console.log(error)
            }
    } 
    // If this is a daily recurring event
    else if (recurrence && recurrence.type === 'daily') {
      console.log("Creating daily recurring events");
      
      // First, create an event for the base day
      const baseEventId = `class-${Date.now()}-daily-${formatDate(baseDate)}`;
      
      const baseEvent = {
        id: baseEventId,
        title,
        start: `${date}T${startTime}`,
        end: `${date}T${endTime}`,
        color,
        textColor: 'white',
        extendedProps: {
          instructor,
          classLevel,
          age: ageGroup,
          duration: calculateDuration(startTime, endTime),
          recurring: 'daily',
        }
      };
      
      newEvents.push(baseEvent);
      console.log(`Created daily recurring event for base day ${formatDate(baseDate)}`);
      
      // For memory efficiency and to avoid overwhelming localStorage, 
      // we'll generate events for a reasonable time period (e.g., 2 weeks)
      // If an end date is specified, we'll respect that
      const maxDaysToGenerate = 14; // 2 weeks
      let daysToGenerate = maxDaysToGenerate;
      
      // Check if there's an end date specified
      if (recurrence.hasEndDate && recurrence.endDate) {
        const endDateObj = new Date(`${recurrence.endDate}T00:00:00`);
        const daysDifference = Math.floor((endDateObj - baseDate) / (24 * 60 * 60 * 1000));
        
        if (daysDifference > 0) {
          // Use the smaller of the two: our max days or the days until the end date
          daysToGenerate = Math.min(daysDifference, maxDaysToGenerate);
          console.log(`Generating daily events for ${daysToGenerate} days until the end date`);
        } else {
          console.log(`End date is on or before the start date, defaulting to ${maxDaysToGenerate} days`);
        }
      } else {
        console.log(`No end date specified, defaulting to ${maxDaysToGenerate} days`);
      }
      
      // Generate events for the specified number of days
      /*for (let i = 1; i <= daysToGenerate; i++) {
        // Clone the base date and add the days
        const eventDate = new Date(baseDate);
        eventDate.setDate(eventDate.getDate() + i);
        
        // Format as YYYY-MM-DD
        const formattedDate = formatDate(eventDate);
        
        // Create a unique ID including the date to avoid collisions
        const eventId = `class-${Date.now()}-daily-${formattedDate}`;
        
        // Create the event
        const newEvent = {
          id: eventId,
          title,
          start: `${formattedDate}T${startTime}`,
          end: `${formattedDate}T${endTime}`,
          color,
          textColor: 'white',
          extendedProps: {
            instructor,
            classLevel,
            age: ageGroup,
            duration: calculateDuration(startTime, endTime),
            recurring: 'daily',
          }
        };

        
        // Add to our collection
        newEvents.push(newEvent);
        console.log(`Created daily recurring event for day ${i}: ${formattedDate}`);
      }
        */

        const postingData = {
            "gym_id" : profileData.gym.id,
            "name" : form.elements.title.value,
            "date" : date,
            "start_time" : startTime,
            "end_time" : endTime,
            "is_canceled" : false,
            "is_recurring" : true,
            "recurrs_Monday" : true,
            "recurrs_Tuesday" : true,
            "recurrs_Wednesday" : true,
            "recurrs_Thursday" : true,
            "recurrs_Friday" : true,
            "recurrs_Saturday" : true,
            "recurrs_Sunday" : true,
            "duration" : class_duration,
            "level" : classLevel,
            "capacity" : 20,
            "notes" : "test",
            "template" : 1
        }
            try {
                await postdata(postingData)
            } catch (error) {
                console.log(error)
            }
      
      console.log(`Generated ${daysToGenerate} days of daily recurring events`);
    }
    else {
      // Not recurring, just create a single event for the selected date
      const eventId = `class-${Date.now()}-single`;
      
      const singleEvent = {
        id: eventId,
        title,
        start: `${date}T${startTime}`,
        end: `${date}T${endTime}`,
        color,
        textColor: 'white',
        extendedProps: {
          instructor,
          classLevel,
          age: ageGroup,
          duration: calculateDuration(startTime, endTime)
        }
      };

            const postingData = {
                "gym_id" : profileData.gym.id,
                "name" : form.elements.title.value,
                "date" : date,
                "start_time" : startTime,
                "end_time" : endTime,
                "is_canceled" : false,
                "is_recurring" : false,
                "recurrs_Monday" : false,
                "recurrs_Tuesday" : false,
                "recurrs_Wednesday" : false,
                "recurrs_Thursday" : false,
                "recurrs_Friday" : false,
                "recurrs_Saturday" : false,
                "recurrs_Sunday" : false,
                "duration" : class_duration,
                "level" : classLevel,
                "capacity" : 20,
                "notes" : "test",
                "template" : 1
            }

            try {
                await postdata(postingData)
            } catch (error) {
                console.log(error)
            }
      
      //newEvents.push(singleEvent);
      //setEvents([])
      console.log(`Created single event for ${date}`);
    }
    
    // No events were created
    /*if (newEvents.length === 0) {
      console.error("No events were created!");
      return;
    }
      */

   setEvents([])

   const data=await getEvents()
   setEvents(data)
    
    // Navigate back to dashboard
    console.log("=== FORM HANDLER COMPLETED ===");
    navigate('/dashboard');
  };

  
  // Helper function to calculate days between two weekdays
  function calculateDayDifference(startDayIndex, targetDayIndex) {
    // If target day is after start day in the week
    if (targetDayIndex > startDayIndex) {
      return targetDayIndex - startDayIndex;
    }
    // If target day is before start day, go to next week
    else if (targetDayIndex < startDayIndex) {
      return 7 - startDayIndex + targetDayIndex;
    }
    // Same day
    else {
      return 0;
    }
  }
  
  // Helper to format date as YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Helper to calculate duration string
  function calculateDuration(start, end) {
    const startParts = start.split(':').map(Number);
    const endParts = end.split(':').map(Number);
    
    let hours = endParts[0] - startParts[0];
    let minutes = endParts[1] - startParts[1];
    
    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  }

  const handleCancelButton = () => {
    navigate('/dashboard');
  };

  return (
    <Box display="flex" style={{ overflowY: 'scroll', height: '100vh' }}>
      <NavigationMenu onWidthChange={setSidebarWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          transition: "margin-left 0.3s ease-in-out",
          marginLeft: `${sidebarWidth}px`
        }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <div style={{ margin: "75px" }}>
            <Typography variant="h3" mb={2}>Add Class</Typography>
            <AddClassInformation handleCancelButton={handleCancelButton} handleSubmit={handleSubmit} showRecurring={true}/>
          </div>
        </Box>
      </Box>
    </Box>
  );
}
