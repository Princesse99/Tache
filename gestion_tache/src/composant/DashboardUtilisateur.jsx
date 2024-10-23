import React, { useState, useEffect } from "react";
import { FaSpinner, FaClipboardCheck, FaTasks, FaCheckCircle, FaBook } from "react-icons/fa";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  TextField,
  Button,
  IconButton,
  CardActionArea,
} from "@mui/material";
import { green, red, blue, purple, yellow } from "@mui/material/colors";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import 'chart.js/auto';

const DashboardUtilisateur = () => {
  const user = useAuthUser();
  const { userId } = user;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [journalEntry, setJournalEntry] = useState("");
  const [journalEntries, setJournalEntries] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Fetch tasks from the backend
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/tasks/user/${userId}`);
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const storedJournals = localStorage.getItem("journalEntries");
    if (storedJournals) {
      setJournalEntries(JSON.parse(storedJournals));
    }
  }, [userId]);

  // Handle journal entry submission
  const handleJournalSubmit = () => {
    const entry = {
      text: journalEntry,
      date: new Date().toLocaleString(),
    };
    let updatedEntries;

    if (isEditing) {
      updatedEntries = journalEntries.map((entry, index) =>
        index === editIndex ? { ...entry, text: journalEntry } : entry
      );
      setIsEditing(false);
      setEditIndex(null);
    } else {
      updatedEntries = [...journalEntries, entry];
    }

    setJournalEntries(updatedEntries);
    localStorage.setItem("journalEntries", JSON.stringify(updatedEntries));
    setJournalEntry(""); 
    setIsFormVisible(false); 
  };

  // Handle journal entry deletion
  const handleDeleteEntry = (index) => {
    const updatedEntries = journalEntries.filter((_, i) => i !== index);
    setJournalEntries(updatedEntries);
    localStorage.setItem("journalEntries", JSON.stringify(updatedEntries));
  };

  // Handle journal entry editing
  const handleEditEntry = (index) => {
    setJournalEntry(journalEntries[index].text);
    setIsEditing(true);
    setEditIndex(index);
    setIsFormVisible(true); 
  };

  // Filter tasks by status
  const tachesNouvelle = tasks.filter(task => task.Status === "Nouveau");
  const tachesEnCours = tasks.filter(task => task.Status === "En cours");
  const tachesTerminee = tasks.filter(task => task.Status === "Terminée");
  const totalTaches = tasks.length;

  // Calculate percentage of tasks by status
  const percentNouvelle = totalTaches === 0 ? 0 : ((tachesNouvelle.length / totalTaches) * 100).toFixed(2);
  const percentEnCours = totalTaches === 0 ? 0 : ((tachesEnCours.length / totalTaches) * 100).toFixed(2);
  const percentTerminee = totalTaches === 0 ? 0 : ((tachesTerminee.length / totalTaches) * 100).toFixed(2);

  // Data for pie chart
  const taskStatusData = {
    labels: ["Nouveau", "En cours", "Terminée"],
    datasets: [
      {
        label: "Répartition des tâches",
        data: [percentNouvelle, percentEnCours, percentTerminee],
        backgroundColor: [blue[500], yellow[500], green[500]],
        hoverBackgroundColor: [blue[700], yellow[700], green[700]],
      },
    ],
  };
  const pieChartOptions = {
    plugins: {
      legend: {
        labels: {
          color: "#fff",  
        },
      },
    },
  };
  
  const handleCardClick = (status) => {
    console.log(`Clicked on ${status} tasks`);
  
  };

  return (
    <Box p={3} sx={{ minHeight: "100vh", color: "#fff", marginLeft: '-90px', marginTop: '40px' }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} mb={4}>
        {/* Total Tasks Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px', height: '150px',width:'250px' }}>
            <CardActionArea onClick={() => handleCardClick('Total')}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <FaTasks style={{ color: "#fff", fontSize: "2rem" }} />
                  <Box ml={2}>
                    <Typography variant="h6" color="#fff">Total Tâches</Typography>
                    <Typography variant="h4" color="#fff">{totalTaches}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        {/* New Tasks Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px', height: '150px' ,width:'250px'}}>
            <CardActionArea onClick={() => handleCardClick('Nouveau')}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <FaClipboardCheck style={{ color: "#fff", fontSize: "2rem" }} />
                  <Box ml={2}>
                    <Typography variant="h6" color="#fff">Nouveau tâches</Typography>
                    <Typography variant="h4" color="#fff">{tachesNouvelle.length}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        {/* In Progress Tasks Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px', height: '150px' ,width:'250px'}}>
            <CardActionArea onClick={() => handleCardClick('En cours')}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <FaSpinner style={{ color: "#fff", fontSize: "2rem" }} />
                  <Box ml={2}>
                    <Typography variant="h6" color="#fff">Tâches en cours</Typography>
                    <Typography variant="h4" color="#fff">{tachesEnCours.length}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        {/* Completed Tasks Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px', height: '150px',width:'250px' }}>
            <CardActionArea onClick={() => handleCardClick('Terminée')}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <FaCheckCircle style={{ color: "#fff", fontSize: "2rem" }} />
                  <Box ml={2}>
                    <Typography variant="h6" color="#fff">Tâches terminées</Typography>
                    <Typography variant="h4" color="#fff">{tachesTerminee.length}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* Combined Layout for Pie Chart and Journal Entries */}
      <Grid container spacing={2} marginLeft={-12} >
      <Grid item xs={12} sm={6}>
  {/* Pie Chart */}
  {loading ? (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <CircularProgress />
    </Box>
  ) : (
    <Card sx={{ width: '300px', margin: "auto", height: '350px', backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px' }}>
      <CardContent>
        <Typography variant="h5" color="#fff" align="center">Statistiques des tâches</Typography>
        <Pie data={taskStatusData} options={pieChartOptions} width={250} height={250} />
      </CardContent>
    </Card>
  )}
</Grid>


        <Grid item xs={12} sm={6}>
          {/* Journal Entries */}
          <Card sx={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px',height:'350px' }}>
            <CardContent>
              <Typography variant="h5" color="#fff">Rapport</Typography>
              <Button variant="outlined" onClick={() => setIsFormVisible(!isFormVisible)} color="#fff" sx={{ marginBottom: 2 ,background:"#03dac5",color:'#fff'}}>
                {isFormVisible ? "Annuler" : "Ajouter une entrée"}
              </Button>

              {isFormVisible && (
                <Box>
              <TextField
                label="Nouvelle entrée"
                variant="outlined"
                fullWidth
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                sx={{
                  marginBottom: 2,
                  '& .MuiInputLabel-root': {
                    color: '#fff', 
                  },
                  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#fff', 
                  },
                  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#fff', 
                  },
                }}
                InputLabelProps={{
                  style: { color: '#fff' },
                }}
              />

                  <Button variant="contained" color="#fff" onClick={handleJournalSubmit} sx={{backgroundColor:"#03dac5",color:'#fff'}} >
                    {isEditing ? "Modifier" : "Ajouter"}
                  </Button>
                </Box>
              )}

              {journalEntries.map((entry, index) => (
                <Box key={index} display="flex" justifyContent="space-between" alignItems="center" marginTop={1}>
                  <Typography color="#fff">{entry.text} </Typography>
                  <Box>
                    <IconButton onClick={() => handleEditEntry(index)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteEntry(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardUtilisateur;
