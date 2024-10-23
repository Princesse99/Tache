import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Box,
  Avatar,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
   Chip,
  Table, TableBody, TableCell,  TableHead, TableRow,
} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaTh, FaList, FaCalendarAlt,FaCheckSquare, FaHeading, 
  FaInfoCircle, FaUserAlt,  FaListAlt, FaCogs } from "react-icons/fa";
import { FaUsers, FaSort, FaEyeSlash } from 'react-icons/fa';
import { DataGrid, gridColumnVisibilityModelSelector } from "@mui/x-data-grid";
import axios from "axios";
import io from "socket.io-client";
import { frFR } from "@mui/x-data-grid/locales";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ExpandLessIcon from '@mui/icons-material/ExpandLess'; 
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; 
const localizer = momentLocalizer(moment);
const socket = io("http://localhost:3001");

function Tache() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [viewType, setViewType] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [isGrouped, setIsGrouped] = useState(false);

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

  const priorityOptions = ["Faible", "Moyenne", "Élevée"];
  const statusOptions = ["Nouveau", "En cours", "Terminée"];
///groupe
const handleGroupTasks = () => {
  setIsGrouped(prev => !prev);
};

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
 // Récupérer les utilisateurs
 const fetchUsers = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/utilisateurs");
    setUsers(response.data);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
  }
};

useEffect(() => {
  fetchUsers(); // Call this inside useEffect to fetch users
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
            if (response.data.error) {
              Swal.fire("Erreur", "Erreur lors de la suppression de la tâche", "error");
            } else {
              setTasks(tasks.filter((task) => task.Id_tache !== taskId));
              Swal.fire("Supprimé", "La tâche a été supprimée.", "success");
            }
          })
          .catch((error) => {
            console.error("Erreur:", error);
            Swal.fire("Erreur", "Erreur lors de la suppression de la tâche", "error");
          });
      }
    });
  };
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Function to handle task selection
  const handleSelectTask = (taskId) => {
    setSelectedTasks(prevSelected => 
      prevSelected.includes(taskId) 
        ? prevSelected.filter(id => id !== taskId) // Deselect if already selected
        : [...prevSelected, taskId] // Add to selected if not already selected
    );
  };
  const filteredTasks = tasks.filter(
    (task) =>
      (task.Titre_tache.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.Description_tache.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus ? task.Status === selectedStatus : true)
  );
///action icon
const [isCollapsed, setIsCollapsed] = useState(false);

const handleToggleCollapse = () => {
  setIsCollapsed(!isCollapsed); // Toggle between collapse and expand
};
// Inside your component
const [visibleTasks, setVisibleTasks] = useState(tasks); // All tasks by default
const [sortDirection, setSortDirection] = useState('asc');

const handleSortTasks = () => {
  const sortedTasks = [...visibleTasks].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a.Titre_tache.localeCompare(b.Titre_tache);
    } else {
      return b.Titre_tache.localeCompare(a.Titre_tache);
    }
  });
  setVisibleTasks(sortedTasks);
  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
};

const handleToggleVisibility = () => {
  // Logic to toggle visibility of tasks (e.g., hide completed tasks)
  const hiddenTasks = visibleTasks.filter(task => task.Status !== 'Terminée');
  setVisibleTasks(hiddenTasks);
};
  const columns = [
    { field: "Titre_tache", headerName: "Titre", flex: 1 },
    { field: "Description_tache", headerName: "Description", flex: 2 },
    { field: "Nom_utilisateur", headerName: "Utilisateur", flex: 1 },
   
    {
      field: "Echeance_tache",
      headerName: "Date Début",
      flex: 1,
      valueFormatter: (params) => new Date(params).toLocaleDateString("fr-FR") || "N/A",
    },
    {
      field: "Date_Fin",
      headerName: "Date Fin",
      flex: 1,
      valueFormatter: (params) => new Date(params).toLocaleDateString("fr-FR") || "N/A",
    },
    {
      field: "Status",
      headerName: "Statut",
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            backgroundColor: getStatusColor(params.value),
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "Priorite",
      headerName: "Priorité",
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            backgroundColor: getPriorityColor(params.value),
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
        >
          {params.value} - {getPriorityPercentage(params.value)}%
        </span>
      ),
    },
    
    { field: "Lieu", headerName: "Lieu", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <IconButton color="gray"  onClick={() => handleEditTask(params.row)}>
            <FaEdit fontSize="15px"/>
          </IconButton>
          <IconButton color="gray" onClick={() => handleDeleteTask(params.row.Id_tache)}>
            <FaTrash  fontSize="15px"/>
          </IconButton>
        </>
      ),
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Nouveau":
        return "blue";
      case "En cours":
        return "orange";
      case "Terminée":
        return "green";
      default:
        return "black";
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
  
  const renderCalendarView = () => (
    <Calendar
      localizer={localizer}
      events={tasks.map((task) => ({
        title: task.Titre_tache,
        start: new Date(task.Echeance_tache),
        end: new Date(task.Date_Fin),
        allDay: true,
      }))}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 400, margin: "20px",fontSize:'12px',marginTop:'30px',width:'1200px' }}
      eventPropGetter={(event) => ({
        style: { backgroundColor: getStatusColor(event.Status) },
      })}
    />
  );
  const styles = {
    dialogPaper: {
      backdropFilter: 'blur(10px)', 
      backgroundColor: 'rgba(255, 255, 255, 0.5)', 
      borderRadius: '15px', 
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)', 
      padding: '30px',
      border: '1px solid rgba(255, 255, 255, 0.18)', 
      width:'500px'
    },
    inputField: {
      marginBottom: '16px',
      borderRadius: '10px', 
    },
    inputLabel: {
      color: '#242130', 
    },
    title: {
      color: '#242130', 
      fontWeight: 'bold',
      marginLeft:'100px',
    },
    saveButton: {
      background: 'linear-gradient(90deg, #F10479 0%, #FB5D91 100%)', 
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '10px',
      textTransform: 'none',
    },
    cancelButton: {
      background: 'rgba(255, 255, 255, 0.3)',
      color: '#242130',
      padding: '10px 20px',
      borderRadius: '10px',
      textTransform: 'none',
    },
  };
  

  return (
    <Box p={2}  marginTop="50px" border="1px solid #ccc" marginLeft="">
      <Box display="flex" justifyContent="space-between" mb={2}>
        {/* <Typography variant="h4">Gestion des Tâches</Typography> */}
        <Button variant="contained" color="primary" onClick={handleAddTask} sx={{marginLeft:'1000px',marginTop:'10px',background:'#03dac5'}}>
          <FaPlus /> Ajouter Tâche
        </Button>
        
      </Box>
      <Box   mb={2} 
      marginLeft="900px" 
      display="flex" 
      alignItems="center"
     >
        
      {/* Settings Icon */}
      <IconButton 
        sx={{
          marginLeft: '50px', 
          color: '#666',
          fontSize: '20px'
        }}
      >
        <SettingsIcon sx={{ fontSize: '24px' }} />
      </IconButton>

      {/* Expand/Collapse Icon */}
      <IconButton 
        sx={{ 
          padding: '5px', 
          fontSize: '20px', 
          marginLeft: '20px',
          color: '#666' 
        }} 
        onClick={handleToggleCollapse}
      >
        {isCollapsed ? (
          <ExpandMoreIcon sx={{ fontSize: '24px' }} />
        ) : (
          <ExpandLessIcon sx={{ fontSize: '24px' }} />
        )}
      </IconButton>
   
      </Box>
      <Box
  mt={2}
  sx={{
    backdropFilter: 'blur(10px)', 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', 
    borderRadius: '15px', 
    padding: '10px',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: "none",
    borderBottom: '1px solid rgba(255, 255, 255, 0.3)', 
    marginTop: '-50px',
    width: '1250px',
    display: 'flex', 
    justifyContent: 'space-between',
  }}
>
  <Button
    onClick={() => setViewType("grid")}
    startIcon={<FaTh color="#fff" fontSize="12px" />}
    sx={{
      fontSize: "12px",
      width:'100%',
      height:"50px",
      color: '#fff', 
      padding: '8px 16px',
      backdropFilter: 'blur(5px)', 
      backgroundColor: 'rgba(255, 255, 255, 0.2)', 
      borderRadius: '10px',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)', 
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)', 
      },
    }}
  >
    Tableau
  </Button>

  <Button
    onClick={() => setViewType("calendar")}
    startIcon={<FaCalendarAlt color="#fff" fontSize="12px" />}
    sx={{
      fontSize: "12px",
      marginLeft:'30px',
      width:'1500px',
      height:"50px",
      color: '#fff',
      padding: '8px 16px',
      backdropFilter: 'blur(5px)', 
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '10px',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)', 
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)', 
      },
    }}
  >
    Calendrier
  </Button>
  <Box >
  <FormControl sx={{ minWidth: 150, borderRadius: '20px',marginLeft:'630px' }}>
  <Select
    value={selectedStatus}
    onChange={(e) => setSelectedStatus(e.target.value)}
    displayEmpty
    sx={{
      border: '1px solid rgba(255, 255, 255, 0.3)', 
      borderRadius: '20px',
      marginTop:'10px',
      width: '150px',
      height: '35px',
      paddingLeft: '10px',
      backdropFilter: 'blur(10px)', 
      backgroundColor: 'rgba(255, 255, 255, 0.2)', 
      color: '#fff', 
      fontSize: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', 
      '& .MuiSelect-icon': {
        color: '#fff', 
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)', 
      },
    }}
    IconComponent={FaFilter} 
  >
    <MenuItem value="">
      Tous
    </MenuItem>
    {statusOptions.map((status) => (
      <MenuItem key={status} value={status}>
        {status}
      </MenuItem>
    ))}
  </Select>
  </FormControl>

  <TextField
  label="Rechercher"
  variant="outlined"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  InputProps={{
    endAdornment: (
      <IconButton sx={{ fontSize: '12px', color: '#fff' }}>
        <FaSearch color="#fff"/>
      </IconButton>
    ),
  }}
  sx={{
    marginLeft: '800px',
    marginTop:'-35px',
    width: '200px',
    height: '35px',
    paddingLeft: '10px',
    backdropFilter: 'blur(10px)', 
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', 
    borderColor: 'rgba(255, 255, 255, 0.3)', 
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.3)', 
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.5)', 
      },
    },
    '& .MuiInputBase-input': {
      padding: '8px',
      fontSize: '12px',
      color: '#fff', 
    },
    '& .MuiInputLabel-root': {
      fontSize: '12px',
      color: '#fff', 
    },
  }}
/>

</Box>

</Box>
      {loading ? (
        <Typography>Chargement des tâches...</Typography>
      ) : (
        <>
          {viewType === "grid" && (
            <div style={{ height: 300, width: "1250px",fontSize:'12px',marginTop:'30px' }}>
              <DataGrid
                rows={filteredTasks}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                getRowId={(row) => row.Id_tache}
                sx={{
                  backdropFilter: "blur(10px)",
                  background: "rgba(255, 255, 255, 0.8)",
                  boxShadow: "0px 1px 10px rgba(0, 0, 0, 0.1)",
                  borderRadius: "10px",
                  width:'1250px',
                  marginLeft:'-10px'
                }}
              />
            </div>
          )}
          {viewType === "calendar" && renderCalendarView()}
        </>
      )}
     <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        PaperProps={{ style: styles.dialogPaper }} 
      >
        <DialogTitle style={styles.title}>{editTask ? "Modifier Tâche" : "Ajouter Tâche"}</DialogTitle>
        
        <DialogContent>
          <TextField
            name="Titre_tache"
            label="Titre"
            value={formData.Titre_tache}
            onChange={handleChange}
            fullWidth
            style={styles.inputField}
            InputLabelProps={{
              style: styles.inputLabel,
            }}
          />
          <TextField
            name="Description_tache"
            label="Description"
            value={formData.Description_tache}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            style={styles.inputField}
            InputLabelProps={{
              style: styles.inputLabel,
            }}
          />
          <TextField
            name="Echeance_tache"
            label="Date Début"
            type="date"
            value={formData.Echeance_tache}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{
              shrink: true,
              style: styles.inputLabel,
            }}
          />
          <TextField
            name="Date_Fin"
            label="Date Fin"
            type="date"
            value={formData.Date_Fin}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{
              shrink: true,
              style: styles.inputLabel,
            }}
          />
          <FormControl fullWidth style={styles.inputField}>
            <InputLabel style={styles.inputLabel}>Status</InputLabel>
            <Select
              name="Status"
              value={formData.Status}
              onChange={handleChange}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth style={styles.inputField}>
            <InputLabel style={styles.inputLabel}>Priorité</InputLabel>
            <Select
              name="Priorite"
              value={formData.Priorite}
              onChange={handleChange}
            >
              {priorityOptions.map((priority) => (
                <MenuItem key={priority} value={priority}>{priority}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="Lieu"
            label="Lieu"
            value={formData.Lieu}
            onChange={handleChange}
            fullWidth
            style={styles.inputField}
            InputLabelProps={{
              style: styles.inputLabel,
            }}
          />
          <FormControl fullWidth style={styles.inputField}>
            <InputLabel style={styles.inputLabel}>Assigner un utilisateur</InputLabel>
            <Select
              name="ID"
              value={formData.ID}
              onChange={handleChange}
              label="Assigner un utilisateur"
            >
              <MenuItem value="">
                <em>Aucun</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.ID} value={user.ID}>
                  {user.Nom_utilisateur} ({user.ID})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)} 
            style={styles.cancelButton}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSaveTask} 
            style={styles.saveButton}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default Tache;
