import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Box,
  Avatar,
  Button,
  Typography,
  CircularProgress,
  TextField,
  Paper,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions,
} from "@mui/material";
import { FaEdit, FaTrash, FaCheckSquare, FaHeading, FaInfoCircle, FaUserAlt, FaCalendarAlt, FaCogs, FaSort, FaFilter } from "react-icons/fa";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

function ListeTache() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [formData, setFormData] = useState({
    Titre_tache: "",
    Description_tache: "",
    Echeance_tache: "",
    Date_Fin: "",
    Status: "Nouveau",
    Priorite: "",
    Lieu: "",
    ID: "",
  });

  useEffect(() => {
    fetchTasks();
    socket.on("task-updated", fetchTasks);
    return () => {
      socket.off("task-updated", fetchTasks);
    };
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches :", error);
      Swal.fire("Erreur", "Erreur lors de la récupération des tâches", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    setEditTaskId(null);
    setFormData({
      Titre_tache: "",
      Description_tache: "",
      Echeance_tache: "",
      Date_Fin: "",
      Status: "Nouveau",
      Priorite: "",
      Lieu: "",
      ID: "",
    });
    setOpenDialog(true);
  };

  const handleSelectTask = (taskId) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  const handleSaveTask = async () => {
    try {
      if (editTaskId) {
        const response = await axios.put(
          `http://localhost:3000/api/tasks/${editTaskId.Id_tache}`,
          formData
        );
        setTasks(
          tasks.map((task) =>
            task.Id_tache === editTaskId.Id_tache ? response.data : task
          )
        );
      } else {
        const response = await axios.post(
          "http://localhost:3000/api/tasks",
          formData
        );
        setTasks([...tasks, response.data]);
        socket.emit("task-assigned", {
          userId: formData.ID,
          taskId: response.data.Id_tache,
          message: `Vous avez une nouvelle tâche assignée: ${formData.Titre_tache}`,
        });
      }
      setOpenDialog(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la tâche :", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur s'est produite lors de la sauvegarde de la tâche.",
      });
    }
  };

  const handleEditTask = (task) => {
    setEditTaskId(task);
    setFormData({
      Titre_tache: task.Titre_tache,
      Description_tache: task.Description_tache,
      Echeance_tache: task.Echeance_tache.split("T")[0],
      Date_Fin: task.Date_Fin.split("T")[0],
      Status: task.Status,
      Priorite: task.Priorite,
      Lieu: task.Lieu,
      ID: task.ID,
    });
    setOpenDialog(true);
  };

  const handleDeleteTask = (taskId) => {
    Swal.fire({
      title: "Supprimer la tâche",
      text: "Voulez-vous vraiment supprimer cette tâche?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:3000/api/tasks/${taskId}`)
          .then((response) => {
            if (!response.data.error) {
              setTasks(tasks.filter((task) => task.Id_tache !== taskId));
              Swal.fire("Supprimé", "La tâche a été supprimée.", "success");
            } else {
              Swal.fire("Erreur", "Erreur lors de la suppression de la tâche", "error");
            }
          })
          .catch((error) => {
            console.error("Erreur lors de la suppression de la tâche :", error);
            Swal.fire("Erreur", "Erreur lors de la suppression de la tâche", "error");
          });
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Nouveau":
        return "#5252D4";
      case "En cours":
        return "#312C38";
      case "Terminée":
        return "#E73C37";
      default:
        return "#ccc";
    }
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Faible":
        return "green";
      case "Moyenne":
        return "orange";
      case "Élevée":
        return "red";
      default:
        return "black";
    }
  };
  const getPriorityPercentage = (priority) => {
    switch (priority) {
      case "Faible":
        return 25; 
      case "Moyenne":
        return 50; 
      case "Élevée":
        return 75; 
      default:
        return 0; 
    }
  };
  
  const sortTasks = (key) => {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (sortOrder === "asc") {
        return a[key] > b[key] ? 1 : -1;
      } else {
        return a[key] < b[key] ? 1 : -1;
      }
    });
    setTasks(sortedTasks);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredTasks = filterStatus
    ? tasks.filter((task) => task.Status === filterStatus)
    : tasks;

  const searchedTasks = filteredTasks.filter((task) =>
    task.Titre_tache.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderListView = () => (
    <Box sx={{ width: '100%', maxWidth: '1300px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Button onClick={() => sortTasks("Titre_tache")} 
          sx={{
            borderRadius: '20px',
            color: '#fff',
            backgroundColor: '#bb86fc',
            padding: '10px 20px',
            textTransform: 'none',
            transition: 'background-color 0.3s',
            '&:hover': { backgroundColor: '#0056b3' }
          }}>
          <FaSort /> Trier par Titre
        </Button>
        <Button onClick={() => setFilterStatus(filterStatus ? "" : "Nouveau")}
          sx={{
            borderRadius: '20px',
            color: '#fff',
            marginLeft:'-500px',
            backgroundColor: filterStatus ? '#ff4757' : '#03dac5',
            padding: '10px 20px',
            textTransform: 'none',
            transition: 'background-color 0.3s',
            '&:hover': { backgroundColor: filterStatus ? '#e74c3c' : '#0056b3' }
          }}>
          <FaFilter /> {filterStatus ? "Afficher Toutes" : "Filtrer Nouveau"}
        </Button>
        <TextField
          label="Rechercher une tâche"
          variant="outlined"
          size="small"
          sx={{ width: '300px', borderRadius: '12px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {['Nouveau', 'En cours', 'Terminée'].map((statusGroup) => {
        const groupTasks = searchedTasks.filter(task => task.Status === statusGroup);

        return (
          <Paper key={statusGroup} sx={{
            padding: '20px',
            marginBottom: '20px',
            background: 'rgba(255, 255, 255, 0.7)', // Transparent background
            backdropFilter: 'blur(10px)', // Blur effect
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: getStatusColor(statusGroup), marginBottom: '-20px' ,height:'40px'}}>
              {statusGroup}: {groupTasks.length}
            </Typography>

            <Button 
              onClick={() => handleAddTask(statusGroup)}
              sx={{
                margin: '10px 0',
                backgroundColor: '#03dac5',
                color: '#fff',
                '&:hover': { backgroundColor: '#0056b3' },
                borderRadius: '12px',
                textTransform: 'none',
                padding: '10px 20px',
                marginLeft:'900px',
                marginTop:'-30px'
              }}
            >
              + Ajouter Tâche
            </Button>

            <div style={{ maxHeight: '150px', overflowY: 'auto',marginTop:'-15px'}}>
              <table style={{ width: '1100px',height:'20px' }}>
                <thead>
                  <tr marginTop="-10px">
                    <th style={{ padding: '10px', textAlign: 'left',fontSize:'13px' }}><FaCheckSquare /> Sélectionner</th>
                    <th style={{ padding: '10px', textAlign: 'left',fontSize:'13px' }}><FaHeading /> Titre</th>
                    <th style={{ padding: '10px', textAlign: 'left',fontSize:'13px' }}><FaInfoCircle /> Description</th>
                    <th style={{ padding: '10px', textAlign: 'left',fontSize:'13px' }}><FaUserAlt /> Assigné</th>
                    <th style={{ padding: '10px', textAlign: 'left',fontSize:'13px' }}><FaCalendarAlt /> Date d'échéance</th>
                    <th style={{ padding: '10px', textAlign: 'left',fontSize:'13px' }}><FaCalendarAlt /> Priorite</th>
 
                    <th style={{ padding: '10px', textAlign: 'left',fontSize:'13px' }}><FaCogs /> Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupTasks.map(task => (
                    <tr key={task.Id_tache} style={{ backgroundColor: selectedTasks.includes(task.Id_tache) ? '#f0f8ff' : 'transparent' }}>
                      <td style={{ padding: '10px' }}>
                        <input type="checkbox" onChange={() => handleSelectTask(task.Id_tache)} checked={selectedTasks.includes(task.Id_tache)} />
                      </td>
                      <td style={{ padding: '10px',fontSize:'13px' }}>{task.Titre_tache}</td>
                      <td style={{ padding: '10px',fontSize:'13px' }}>{task.Description_tache || 'Aucune description'}</td>
                    <td className="py-2 px-4 ">
                        {task.Image_utilisateur ? (
                            <div className="flex items-center mt-2 text-xs md:text-sm">
                                <img
                                    src={`http://localhost:3000${task.Image_utilisateur}`}
                                    alt={task.Nom_utilisateur}
                                    className="w-6 h-6 rounded-full mr-2 md:w-8 md:h-8 border-2 border-gray-200 shadow-md" // Added shadow and border for emphasis
                                />
                              {/* Displaying the username next to the image */}
                            </div>
                        ) : (
                            <span className="text-gray-500 italic">Pas d'image</span> // Style for "No image" text
                        )}
                    </td>

                      <td style={{ padding: '10px',fontSize:'13px' }}>{task.Echeance_tache || 'Pas de date'}</td>
                      <div style={{
                            backgroundColor: getPriorityColor(task.Priorite),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}>
                            {task.Priorite} - {getPriorityPercentage(task.Priorite)}%
                          </div>
                      <td style={{ padding: '10px' ,fontSize:'13px'}}>
                        <Button onClick={() => handleEditTask(task)} sx={{ color: '#007bff', textTransform: 'none' }}><FaEdit /> </Button>
                        <Button onClick={() => handleDeleteTask(task.Id_tache)} sx={{ color: '#e74c3c', textTransform: 'none' }}><FaTrash /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Paper>
        );
      })}
    </Box>
  );

  return (
    <>
      <Box>{loading ? <CircularProgress /> : renderListView()}</Box>

      <Button
        onClick={handleAddTask}
        sx={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          borderRadius: "50%",
          padding: "15px",
          backgroundColor: "#007bff",
          color: "#fff",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          transition: "background-color 0.3s",
          "&:hover": { backgroundColor: "#0056b3" },
        }}
      >
        <FaCheckSquare />
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editTaskId ? "Modifier Tâche" : "Ajouter Nouvelle Tâche"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Titre de la tâche"
            name="Titre_tache"
            value={formData.Titre_tache}
            onChange={handleChange}
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Description"
            name="Description_tache"
            value={formData.Description_tache}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            multiline
            rows={4}
          />
          <TextField
            margin="dense"
            label="Date d'échéance"
            name="Echeance_tache"
            type="date"
            value={formData.Echeance_tache}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Date de Fin"
            name="Date_Fin"
            type="date"
            value={formData.Date_Fin}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Priorité"
            name="Priorite"
            value={formData.Priorite}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Lieu"
            name="Lieu"
            value={formData.Lieu}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Assigné à"
            name="ID"
            value={formData.ID}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Annuler
          </Button>
          <Button onClick={handleSaveTask} color="primary">
            {editTaskId ? "Sauvegarder" : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ListeTache;
