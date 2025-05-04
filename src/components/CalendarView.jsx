"use client";

import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parse, startOfWeek, format, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";


const EventOnlyTitle = ({ event }) => {
  console.log(event);
  
  return <div>{event.title}</div>;
};

const NoTimeGutter = () => null;
const NoAgendaTime = () => null;

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;

  const [hours, minutes] = timeStr.split(":") || [];
  if (!hours || !minutes) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));
  return date;
}

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("week");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/calendar/tasks");
        const data = await res.json();

        const tasks = Array.isArray(data?.tasks) ? data.tasks : [];
        const recurringTasks = Array.isArray(data?.recurringTasks)
          ? data.recurringTasks
          : [];

        const mappedTasks = tasks
          .map((task) => {
            const start = combineDateAndTime(task.dueDate, task.startTime);
            if (!start) return null;

            const end = new Date(
              start.getTime() + (task.duration || 30) * 60 * 1000
            );

            return {
              id: task.id,
              title: task.title || "Untitled Task",
              start,
              end,
              priority: task.priority || "normal",
              status: task.status || "Pending",
              allDay: false,
            };
          })
          .filter(Boolean);

        const mappedRecurring = recurringTasks.flatMap((task) => {
          const occurrences = [];
          const startDate = new Date(task.startDate);
          if (isNaN(startDate.getTime())) return [];

          const maxOccurrences = 7;

          for (let i = 0; i < maxOccurrences; i++) {
            const current = new Date(startDate);
            current.setDate(
              current.getDate() + i * (task.recurrenceInterval || 1)
            );

            if (task.endDate && new Date(current) > new Date(task.endDate))
              break;

            const start = combineDateAndTime(
              current.toISOString(),
              task.startTime
            );
            if (!start) continue;

            const end = new Date(
              start.getTime() + (task.duration || 30) * 60 * 1000
            );

            occurrences.push({
              id: `${task.id}-${i}`,
              title: `[R] ${task.title || "Untitled Recurring Task"}`,
              start,
              end,
              priority: task.priority || "normal",
              status: "Recurring",
              allDay: false,
            });
          }
          
          return occurrences;
        });
 
        setEvents([...mappedTasks, ...mappedRecurring]);
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="p-4 w-full">
      <h2 className="text-xl font-bold mb-4">📅 Calendar View</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        view={currentView}
        onView={(view) => setCurrentView(view)}
        style={{ height: "80vh" }}
        views={["month", "week", "day"]}
        defaultView="week"
        eventPropGetter={(event) => {
          let bgColor = event.status === "Completed" ? "#9ae6b4" : "#fbb6ce";
          if (event.status === "Recurring") bgColor = "#fef08a";

          return {
            style: {
              backgroundColor: bgColor,
              color: "#333",
              borderRadius: "8px",
              padding: "4px",
            },
          };
        }}
      />
    </div>
  );
};

export default CalendarView;
