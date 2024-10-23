import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

const locales = { 'fr': fr };
const localizer = dateFnsLocalizer({
  format: (date, formatStr) => format(date, formatStr, { locale: fr }),
  parse: (dateString, formatString, baseDate) => parse(dateString, formatString, baseDate, { locale: fr }),
  startOfWeek: () => startOfWeek(new Date(), { locale: fr }),
  getDay: (date) => getDay(date),
  locales
});

const DnDCalendar = withDragAndDrop(Calendar);

function TaskCalendar() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3000/api/tasks')
            .then(response => {
                const tasks = response.data;
                const calendarEvents = tasks.map(task => {
                    const start = new Date(task.Echeance_tache);
                    const end = new Date(task.Date_Fin);
                    return {
                        id: task.id,
                        title: task.Titre_tache,
                        start,
                        end,
                        allDay: true,
                        resource: task,
                    };
                });
                setEvents(calendarEvents);
            })
            .catch(error => console.error('Erreur lors de la récupération des tâches :', error));
    }, []);

    const handleEventResize = ({ event, start, end }) => {
        const updatedEvents = events.map(existingEvent => {
            if (existingEvent.id === event.id) {
                return { ...existingEvent, start, end };
            }
            return existingEvent;
        });
        setEvents(updatedEvents);

        axios.put(`http://localhost:3000/api/tasks/${event.id}`, {
            ...event.resource,
            Echeance_tache: start.toISOString(),
            Date_Fin: end.toISOString()
        }).then(() => {
            console.log('Date de fin mise à jour');
        }).catch(error => console.error('Erreur lors de la mise à jour des dates de la tâche :', error));
    };

    // Glassmorphism Styles
    // const containerStyle = {
    //     padding: '20px',
    //     background: 'rgba(255, 255, 255, 0.1)',
    //     borderRadius: '20px',
    //     backdropFilter: 'blur(20px)',
    //     boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
    //     border: '1px solid rgba(255, 255, 255, 0.2)',
    //     marginTop: '40px',
    //     width: '80%',
    //     marginLeft: 'auto',
    //     marginRight: 'auto',
    //     color: '#ffffff',
    //     position: 'relative',
    // };

    const titleStyle = {
        fontSize: '36px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#ffffff',
        textShadow: '0px 4px 30px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
    };

    const calendarStyle = {
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: '#ffffff',
    };

    const gradientOverlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(255, 94, 132, 0.3), rgba(255, 75, 204, 0.1))',
        zIndex: -1,
        filter: 'blur(50px)',
    };

    return (
        <div style={{ position: 'relative', width: '1100px', height: '100px',marginLeft:'50px' }}>
            <div style={gradientOverlayStyle}></div>
            <div >
                <div style={titleStyle}>
                    <h1>Calendrier des Tâches</h1>
                </div>

                <div style={calendarStyle}>
                    <DnDCalendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 500 }}
                        resizable
                        onEventResize={handleEventResize}
                        formats={{
                            dayFormat: (date, culture, localizer) => localizer.format(date, 'EEEE', culture),
                        }}
                        messages={{
                            allDay: "Toute la journée",
                            next: <FaArrowRight />,
                            previous: <FaArrowLeft />,
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
                    />
                </div>
            </div>
        </div>
    );
}

export default TaskCalendar;
