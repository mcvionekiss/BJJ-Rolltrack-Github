import React, { useState } from 'react';
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from '@mui/material/TextField';
import dayjs from "dayjs";
import "./Register.css";

const ScheduleDetails = ({ onContinue, onBack, setScheduleData }) => {
  const [schedule, setSchedule] = useState(
    ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => ({
      day,
      openTime: "12:00 PM",
      closeTime: "12:00 PM",
      closed: day === "SUN", // Default Sunday as closed
    }))
  );

  const handleTimeChange = (index, field, value) => {
    setSchedule(prev => {
      const updatedSchedule = prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      );
      setScheduleData(updatedSchedule); // Update form data in parent
      return updatedSchedule;
    });
  };

  const handleClosedToggle = index => {
    setSchedule(prev => {
      const updatedSchedule = prev.map((item, i) => 
        i === index ? { ...item, closed: !item.closed } : item
      );
      setScheduleData(updatedSchedule); // Update form data in parent
      return updatedSchedule;
    });
  };

  return (
    <div className="schedule-container">
      <p>Gym Hours of Operation</p>
      <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Opening Time</th>
            <th>Closing Time</th>
            <th>Closed</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((entry, index) => (
            <tr key={entry.day}>
              <td>{entry.day}</td>
                <td>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
                            value={dayjs(entry.openTime, "h:mm A")}
                            onChange={(newTime) => handleTimeChange(index, "openTime", newTime.format("h:mm A"))}
                            disabled={entry.closed}
                            renderInput={(params) => <TextField {...params} size="small" />}
                        />
                    </LocalizationProvider>
                </td>
                <td>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
                            value={dayjs(entry.closeTime, "h:mm A")}
                            onChange={(newTime) => handleTimeChange(index, "closeTime", newTime.format("h:mm A"))}
                            disabled={entry.closed}
                            renderInput={(params) => <TextField {...params} size="small" />}
                        />
                    </LocalizationProvider>
                </td>
              <td>
                <input
                  type="checkbox"
                  checked={entry.closed}
                  onChange={() => handleClosedToggle(index)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default ScheduleDetails;