import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { FaArrowRight,FaArrowLeft } from "react-icons/fa";

// Define the localizer using date-fns
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { fr }
});

function TaskCalendar() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3000/api/tasks')
            .then(response => {
                const tasks = response.data;
                const calendarEvents = tasks.map(task => {
                    const start = new Date(task.Echeance_tache);
                    const end = new Date(task.Echeance_tache);

                    return {
                        title: task.Titre_tache, // Make sure task.Titre_tache is in French
                        start,
                        end,
                        allDay: true,
                        resource: task,
                    };
                });
                setEvents(calendarEvents);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des tâches :', error);
            });
    }, []);

    return (
        <div className="container mx-auto mt-5 px-4 w-screen max-w-screen-lg">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Calendrier des Tâches</h1>
            </div>

            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                messages={{
                    next: <FaArrowRight/>,
                    previous: <FaArrowLeft/>,
                    today: "Aujourd'hui",
                    month: "Mois",
                    week: "Semaine",
                    day: "Jour",
                    agenda: "Agenda",
                    date: "Date",
                    time: "Heure",
                    event: "Événement",
                    noEventsInRange: "Aucun événement dans cette plage de dates.",
                    showMore: total => `+ ${total} plus`
                }}
                className="bg-white  rounded-lg shadow-md p-4"
            />
        </div>
    );
}

export default TaskCalendar;
