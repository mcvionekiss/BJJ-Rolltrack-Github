"use client";

import React, { useState, useEffect } from "react";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";
import styles from "../register/Register.module.css"; // <-- import module

const ScheduleDetails = ({ setScheduleData, initialSchedule = [] }) => {
  const defaultSchedule = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
    (day) => ({
      day,
      openTime: dayjs().hour(12).minute(0),
      closeTime: dayjs().hour(12).minute(0),
      closed: day === "SUN",
    })
  );

  const [schedule, setSchedule] = useState(
    initialSchedule && initialSchedule.length
      ? initialSchedule
      : defaultSchedule
  );

  // helper to detect Dayjs object (works whether or not dayjs.isDayjs exists)
  const isDayjs = (obj) =>
    (dayjs.isDayjs && dayjs.isDayjs(obj)) ||
    (obj &&
      typeof obj.format === "function" &&
      typeof obj.isValid === "function");

  // parse any incoming initialSchedule strings into Dayjs objects once on mount / when initialSchedule changes
  useEffect(() => {
    if (initialSchedule && initialSchedule.length) {
      const parsedSchedule = initialSchedule.map((entry) => ({
        ...entry,
        openTime:
          typeof entry.openTime === "string"
            ? dayjs(entry.openTime, "h:mm A")
            : isDayjs(entry.openTime)
            ? entry.openTime
            : dayjs().hour(12).minute(0),
        closeTime:
          typeof entry.closeTime === "string"
            ? dayjs(entry.closeTime, "h:mm A")
            : isDayjs(entry.closeTime)
            ? entry.closeTime
            : dayjs().hour(12).minute(0),
      }));
      setSchedule(parsedSchedule);
    } else {
      setSchedule(defaultSchedule);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSchedule]);

  // keep parent up to date whenever schedule changes
  useEffect(() => {
    if (typeof setScheduleData === "function") {
      const scheduleForParent = schedule.map((s) => ({
        ...s,
        openTime: isDayjs(s.openTime)
          ? s.openTime.format("h:mm A")
          : String(s.openTime),
        closeTime: isDayjs(s.closeTime)
          ? s.closeTime.format("h:mm A")
          : String(s.closeTime),
      }));
      setScheduleData(scheduleForParent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule]);

  const handleTimeChange = (index, field, value) => {
    // value may be null or a Dayjs object; ensure it's valid
    if (!value) return;
    if (typeof value.isValid === "function" && !value.isValid()) return;

    setSchedule((prev) => {
      const updatedSchedule = prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return updatedSchedule;
    });
  };

  const handleClosedToggle = (index) => {
    setSchedule((prev) => {
      const updatedSchedule = prev.map((item, i) =>
        i === index ? { ...item, closed: !item.closed } : item
      );
      return updatedSchedule;
    });
  };

  return (
    <div className={styles["schedule-container"] || ""}>
      <p>Gym Hours of Operation</p>
      <div className={styles["table-wrapper"] || ""}>
        <table className={styles.scheduleTable}>
          {" "}
          {/* <-- apply local class */}
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
                      value={
                        isDayjs(entry.openTime)
                          ? entry.openTime
                          : dayjs(entry.openTime, "h:mm A")
                      }
                      onChange={(newTime) =>
                        handleTimeChange(index, "openTime", newTime)
                      }
                      disabled={!!entry.closed}
                      renderInput={(params) => (
                        <TextField {...params} size="small" />
                      )}
                    />
                  </LocalizationProvider>
                </td>
                <td>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      value={
                        isDayjs(entry.closeTime)
                          ? entry.closeTime
                          : dayjs(entry.closeTime, "h:mm A")
                      }
                      onChange={(newTime) =>
                        handleTimeChange(index, "closeTime", newTime)
                      }
                      disabled={!!entry.closed}
                      renderInput={(params) => (
                        <TextField {...params} size="small" />
                      )}
                    />
                  </LocalizationProvider>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!entry.closed}
                    onChange={() => handleClosedToggle(index)}
                    aria-label={`${entry.day}-closed-toggle`}
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
