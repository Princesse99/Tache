import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/fr";
import axios from "axios";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { Tab, Tabs } from "@mui/material";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

moment.locale("fr");

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const TacheCalendarUtilisateur = () => {
  const authUser = useAuthUser();
  const { userId } = authUser;

  const [events, setEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState("tout");

  const taskColors = {
    "En cours": "#FFD700", 
    "Terminée": "#32CD32", 
    "Nouveau": "#1E90FF", 
    "personnalisé": "#5dade2", 
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/tasks/user/${userId}`);
        const tasks = response.data.map(task => ({
          id: task.Id_tache,
          title: task.Description_tache,
          start: new Date(task.Echeance_tache),
          end: new Date(task.Date_Fin),
          category: task.Status || "personnalisé", 
        }));
        setEvents(tasks);
      } catch (error) {
        console.error("Erreur lors de la récupération des tâches :", error);
      }
    };

    fetchTasks();
  }, [userId]);

  const filteredEvents = events.filter(event => selectedTab === "tout" || event.category === selectedTab);

  const messages = {
    allDay: "Toute la journée",
    previous: <FaArrowLeft style={{ color: "#FFB5BF" ,fontFamily:'inherit',fontSize:'20px'}} />,
    next: <FaArrowRight style={{ color: "#FFB5BF" ,fontFamily:'inherit',fontSize:'20px'}}/>,
    today: <span style={{ fontWeight: "bold", color: "#FFB5BF" ,fontFamily:'inherit',fontSize:'20px'}}>Aujourd'hui</span>,
    month: "Mois",
    week: "Semaine",
    day: "Jour",
    agenda: "Agenda",
    date: "Date",
    time: "Heure",
    event: "Événement",
    noEventsInRange: "Aucun événement dans cette plage de dates.",
    showMore: total => `+ ${total} de plus`,
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleEventResize = ({ event, start, end }) => {
    const updatedEvents = events.map(existingEvent => {
      if (existingEvent.id === event.id) {
        return { ...existingEvent, start, end };
      }
      return existingEvent;
    });
    setEvents(updatedEvents);

    axios.put(`http://localhost:3000/api/tasks/${event.id}`, {
      ...event,
      Echeance_tache: start.toISOString(),
      Date_Fin: end.toISOString()
    }).then(() => {
      console.log('Événement mis à jour');
    }).catch(error => {
      console.error('Erreur lors de la mise à jour de l\'événement :', error);
    });
  };

  const eventStyleGetter = (event) => {
    const backgroundColor = taskColors[event.category] || "#D3D3D3"; 
    const style = {
      backgroundColor,
      borderRadius: "10px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
      backdropFilter: "blur(10px)", 
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    };
    return { style };
  };

  return (
    <div
      style={{
        height: "100vh",
        marginTop: '100px',
        width: '1100px',
        marginLeft: '-50px',
        backdropFilter: 'blur(15px)',
      }}
    >
      <div
        style={{
          height: "80vh",
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '15px',
        }}
      >
        <DnDCalendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{
            height: "100%",
            padding: '10px',
            backgroundColor: 'transparent',
          }}
          messages={messages}
          eventPropGetter={eventStyleGetter}
          resizable
          onEventResize={handleEventResize}
        />
      </div>
    </div>
  );
};

export default TacheCalendarUtilisateur;
