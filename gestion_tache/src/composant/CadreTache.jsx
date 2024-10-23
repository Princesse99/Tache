import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Box,
  Avatar,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  IconButton,
  CircularProgress,
  Grid,
} from "@mui/material";
import { FaPlus } from "react-icons/fa";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

function CadreTache() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState(null);
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
  const [anchorEl, setAnchorEl] = useState(null);
  const priorityOptions = ["Faible", "Moyenne", "Élevée"];
  const statusOptions = ["Nouveau", "En cours", "Terminée"];

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    socket.on("task-updated", fetchTasks);
    return () => {
      socket.off("task-updated", fetchTasks);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/utilisateurs");
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddTask = () => {
    setEditTask(null);
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

  const handleEditTask = (task) => {
    setEditTask(task);
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

  const handleSaveTask = async () => {
    try {
      if (editTask) {
        const response = await axios.put(
          `http://localhost:3000/api/tasks/${editTask.Id_tache}`,
          formData
        );
        setTasks(tasks.map((task) => (task.Id_tache === editTask.Id_tache ? response.data : task)));
      } else {
        if (!formData.ID) {
          Swal.fire({
            icon: 'warning',
            title: 'Avertissement',
            text: 'Veuillez assigner un utilisateur.',
          });
          return;
        }
        const response = await axios.post("http://localhost:3000/api/tasks", formData);
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
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur s\'est produite lors de la sauvegarde de la tâche.',
      });
    }
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
        axios.delete(`http://localhost:3000/api/tasks/${taskId}`)
          .then((response) => {
            if (!response.data.error) {
              setTasks(tasks.filter((task) => task.Id_tache !== taskId));
              Swal.fire("Supprimé", "La tâche a été supprimée.", "success");
            } else {
              Swal.fire("Erreur", "Erreur lors de la suppression de la tâche", "error");
            }
          })
          .catch((error) => {
            console.error("Erreur:", error);
            Swal.fire("Erreur", "Erreur lors de la suppression de la tâche", "error");
          });
      }
    });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action, task) => {
    handleMenuClose();
    if (action === "edit") {
      handleEditTask(task);
    } else if (action === "delete") {
      handleDeleteTask(task.Id_tache);
    }
  };

  const renderKanbanView = () => {
    const groupedTasks = tasks.reduce((acc, task) => {
      const status = task.Status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
      return acc;
    }, {});

    const statusColors = {
      'En cours': '#e3f2fd',
      'Nouveau': '#bbdefb',
      'Terminée': '#c8e6c9',
    };

    const glassEffect = {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      backdropFilter: "blur(10px)",
      borderRadius: "16px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
    };

    return (
      <Grid container spacing={2} justifyContent="center" sx={{ marginTop: "100px",marginLeft:'100px',width:'900px' }}>
        {Object.entries(groupedTasks).map(([status, tasks]) => (
          <Grid item xs={12} sm={6} md={4} key={status}>
            <Box
              m={1}
              p={2}
              sx={{
                ...glassEffect,
                backgroundColor: statusColors[status] || 'rgba(255, 255, 255, 0.15)',
              }}
            >
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" align="center" gutterBottom>
                  {status}: {tasks.length}
                </Typography>
                <Button onClick={handleAddTask}>
                  <FaPlus />
                </Button>
              </Box>
              <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                {tasks.length === 0 ? (
                  <Typography variant="body2" align="center" color="text.secondary">
                    Aucune tâche
                  </Typography>
                ) : (
                  tasks.map((task) => (
                    <Box
                      key={task.Id_tache}
                      m={1}
                      p={2}
                      borderRadius={4}
                      sx={{
                        ...glassEffect,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '50px',
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar
                          alt={task.Titre_tache}
                          src={task.userImage || '/path/to/default-image.jpg'}
                          sx={{ marginRight: 1 }}
                        />
                        <Typography fontSize="12px" fontWeight="bold">
                          {task.Titre_tache}
                        </Typography>
                      </Box>
                      <Typography fontSize="10px" color="text.secondary" mb={1}>
                        {task.Description_tache}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography fontSize="10px" color="text.secondary">
                          {task.Priorite} - {task.Lieu}
                        </Typography>
                        <IconButton
                          onClick={handleMenuOpen}
                          size="small"
                          aria-controls={Boolean(anchorEl) ? 'task-menu' : undefined}
                          aria-haspopup="true"
                          aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                        >
                          <MoreHorizIcon fontSize="small" />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={() => handleMenuAction('edit', task)}>
                            <EditIcon /> Éditer
                          </MenuItem>
                          <MenuItem onClick={() => handleMenuAction('delete', task)}>
                            <DeleteIcon /> Supprimer
                          </MenuItem>
                        </Menu>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <div>
      {loading ? (
        <CircularProgress />
      ) : (
        renderKanbanView()
      )}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editTask ? "Modifier la tâche" : "Ajouter une nouvelle tâche"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="Titre_tache"
            label="Titre de la tâche"
            type="text"
            fullWidth
            value={formData.Titre_tache}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="Description_tache"
            label="Description de la tâche"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={formData.Description_tache}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="Echeance_tache"
            label="Échéance"
            type="date"
            fullWidth
            value={formData.Echeance_tache}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            name="Date_Fin"
            label="Date de fin"
            type="date"
            fullWidth
            value={formData.Date_Fin}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            name="Lieu"
            label="Lieu"
            type="text"
            fullWidth
            value={formData.Lieu}
            onChange={handleChange}
          />
          <TextField
            select
            label="Priorité"
            name="Priorite"
            value={formData.Priorite}
            onChange={handleChange}
            fullWidth
            margin="dense"
          >
            {priorityOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Statut"
            name="Status"
            value={formData.Status}
            onChange={handleChange}
            fullWidth
            margin="dense"
          >
            {statusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Assigné à"
            name="ID"
            value={formData.ID}
            onChange={handleChange}
            fullWidth
            margin="dense"
          >
            {users.map((user) => (
              <MenuItem key={user.ID} value={user.ID}>
                {user.Nom}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleSaveTask}>{editTask ? "Modifier" : "Ajouter"}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CadreTache;
