import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  ButtonBase,
  Popover,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import {
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaTasks, FaPlus, FaSpinner, FaCheckCircle } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [taskCounts, setTaskCounts] = useState({
    totalTaches: 0,
    tachesEnCours: 0,
    tachesTerminees: 0,
    tachesEnAttente: 0,
  });
  const [dailyTaskStats, setDailyTaskStats] = useState([]);
  const [monthlyTaskCounts, setMonthlyTaskCounts] = useState([]);
  const [tasksByStatus, setTasksByStatus] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  useEffect(() => {
    const fetchTaskCounts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/taskCounts");
        if (!response.ok) throw new Error("Error fetching task counts");
        const data = await response.json();
        setTaskCounts(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchDailyTaskStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/dailyTaskStats"
        );
        if (!response.ok) throw new Error("Error fetching daily task stats");
        const data = await response.json();
        setDailyTaskStats(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchMonthlyTaskCounts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/tasks/monthly"); // Updated API endpoint
        if (!response.ok) throw new Error("Error fetching monthly task counts");
        const data = await response.json();
        setMonthlyTaskCounts(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTaskCounts();
    fetchDailyTaskStats();
    fetchMonthlyTaskCounts();
  }, []);
///affiche de liste tache dans petit menu
const handleStatusClick = async (status, event) => {
  setAnchorEl(event.currentTarget);
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/status/${status}`);
    const data = await response.json();
    setTasksByStatus(data);
  } catch (err) {
    console.error(err);
  }
};
const handleClose = () => {
  setAnchorEl(null);
  setTasksByStatus([]);
};

const open = Boolean(anchorEl);
const id = open ? "simple-popover" : undefined;

  const labels = dailyTaskStats.map((stat) => stat.date);
  const enCoursData = dailyTaskStats
    .filter((stat) => stat.Status === "En cours")
    .map((stat) => stat.count);
  const termineeData = dailyTaskStats
    .filter((stat) => stat.Status === "Terminée")
    .map((stat) => stat.count);
  const nouveauData = dailyTaskStats
    .filter((stat) => stat.Status === "Nouveau")
    .map((stat) => stat.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "En cours",
        data: enCoursData,
        backgroundColor: "rgba(255, 159, 64, 0.7)",
        borderColor: "#FF9F40",
        borderWidth: 1,
      },
      {
        label: "Terminée",
        data: termineeData,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "#36A2EB",
        borderWidth: 1,
      },
      {
        label: "Nouveau",
        data: nouveauData,
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "#4BC0C0",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#FFFFFF" },
      },
      title: {
        display: true,
        text: "Statistiques des Tâches par jour",
        color: "#FFFFFF",
      },
    },
    scales: {
      x: {
        ticks: { color: "#FFFFFF" },
        grid: { color: "rgba(255, 255, 255, 0.2)" },
      },
      y: {
        ticks: { color: "#FFFFFF" },
        grid: { color: "rgba(255, 255, 255, 0.2)" },
      },
    },
  };

  const cardStyle = {
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.15))",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
    borderRadius: "16px",
    padding: "24px",
    color: "#fff",
    textAlign: "center",
  };

  const cardTitleStyle = {
    fontSize: "20px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const cardValueStyle = {
    fontSize: "40px",
    fontWeight: "800",
    marginTop: "12px",
    color: "#fff",
  };

  return (
    <Box sx={{ flexGrow: 1, pt: 4, px: 2, marginTop: "40px" }}>
      <Grid container spacing={4}>
        {/* Task Count Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <ButtonBase sx={{ width: "100%" }} onClick={(event) => handleStatusClick("Total", event)}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={cardTitleStyle} >
                  <FaTasks /> Total tâches
                </Typography>
                <Typography variant="h4" sx={cardValueStyle}>
                  {taskCounts.totalTaches}
                </Typography>
              </CardContent>
            </Card>
          </ButtonBase>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ButtonBase sx={{ width: "100%" }} onClick={(event) => handleStatusClick("Nouveau", event)}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={cardTitleStyle}>
                  <FaPlus /> Nouveaux tâches
                </Typography>
                <Typography variant="h4" sx={cardValueStyle}>
                  {taskCounts.tachesEnAttente}
                </Typography>
              </CardContent>
            </Card>
          </ButtonBase>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ButtonBase sx={{ width: "100%" }} onClick={(event) => handleStatusClick("En cours", event)}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={cardTitleStyle}>
                  <FaSpinner /> Tâche en cours
                </Typography>
                <Typography variant="h4" sx={cardValueStyle}>
                  {taskCounts.tachesEnCours}
                </Typography>
              </CardContent>
            </Card>
          </ButtonBase>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ButtonBase sx={{ width: "100%" }}onClick={(event) => handleStatusClick("Terminée", event)}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={cardTitleStyle}>
                  <FaCheckCircle /> Tâche terminees
                </Typography>
                <Typography variant="h4" sx={cardValueStyle}>
                  {taskCounts.tachesTerminees}
                </Typography>
              </CardContent>
            </Card>
          </ButtonBase>
        </Grid>

        {/* Bar Chart */}
        <Grid item sx={{ width: "500px" ,marginLeft:'30px'}}>
          <Card sx={{ ...cardStyle, height: "350px" }}>
            <CardContent>
              <Bar data={chartData} options={options} height={300} />
            </CardContent>
          </Card>
        </Grid>
       {/*formulaire ampisahona an le status*/ }
       <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{
          "& .MuiPaper-root": {
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.7)", 
            border: "1px solid rgba(255, 255, 255, 0.3)", 
            borderRadius: "8px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)", 
          },
        }}
      >
        <Box sx={{ padding: 2 }}>
          {tasksByStatus.length === 0 ? (
            <Typography variant="body2">Aucune tâche disponible.</Typography>
          ) : (
            tasksByStatus.map((task) => (
              <Box key={task.Id_tache} sx={{ marginBottom: 1 }}>
                <Typography variant="body1">{task.Titre_tache}</Typography>
                <Typography variant="body2" color="#242130">
                  {task.Description_tache}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Popover>
        {/* Monthly Task Counts */}
        <Grid sx={{ marginTop: "40px", marginLeft: "100px"}}>
          <Card sx={cardStyle }  >
            <CardContent>
              <Typography variant="h6" sx={cardTitleStyle}>
                Utilisateur ayant le plus de tâches par mois
              </Typography>
              {monthlyTaskCounts.length > 0 ? (
                monthlyTaskCounts.map((user) => (
                  <Box
                    key={user.userName}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    {user.userImage && (
                      <img
                        src={`http://localhost:3000${user.userImage}`} 
                        alt={user.userName}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          marginRight: "10px",
                        }}
                      />
                    )}

                    <Typography>
                      {user.userName}: {user.taskCount}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography>Aucune tâche pour ce mois.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
