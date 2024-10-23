import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FaCheckCircle, FaSearch } from "react-icons/fa";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { format } from "date-fns";
import { frFR } from "@mui/x-data-grid/locales";

const TacheUtilisateur = () => {
  const user = useAuthUser();
  const { userId, nom } = user;
  const [tasks, setTasks] = useState([]);
  const [validatedTasks, setValidatedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // New state for filtering by status

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/tasks/user/${userId}`
      );
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks for user:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const send_tache = async (tache) => {
    const { Id_tache, Description_tache, Status } = tache;
    try {
      const response = await axios.post(
        `http://localhost:3000/api/create-notification`,
        {
          Id_tache,
          tache: Description_tache,
          utilisateur: nom,
          date: new Date(),
          id_user: userId,
          status: Status,
        }
      );
      if (response.status === 200) {
        setValidatedTasks([...validatedTasks, Id_tache]);
        fetchTasks();
      }
    } catch (error) {
      console.error("There was an error sending the request:", error);
    }
  };

  const columns = [
    { field: "Titre_tache", headerName: "Titre", flex: 1 },
    { field: "Description_tache", headerName: "Description", flex: 2 },
    { field: "Priorite", headerName: "Status", flex: 1 },
    {
      field: "Echeance_tache",
      headerName: "Date Début",
      flex: 1,
      valueFormatter: (params) => {
        const d = format(new Date(params), "dd-MM-yyyy");
        return d || "N/A";
      },
    },
    {
      field: "Date_Fin",
      headerName: "Date Fin",
      flex: 1,
      valueFormatter: (params) => {
        const d = format(new Date(params), "dd-MM-yyyy");
        return d || "N/A";
      },
    },
    { field: "Lieu", headerName: "Lieu", flex: 1 },
    {
      field: "Status",
      headerName: "Etat",
      flex: 1,
      cellClassName: (params) => {
        switch (params.value) {
          case "En cours":
            return "status-en-cours";
          case "Terminée":
            return "status-terminee";
          case "Nouveau":
            return "status-nouveau";
          default:
            return "";
        }
      },
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <IconButton
          onClick={() => send_tache(params.row)}
          color="primary"
          disabled={validatedTasks.includes(params.row.Id_tache)}
        >
          <FaCheckCircle color="green" />
        </IconButton>
      ),
    },
  ];

  // Filter tasks based on search query and status filter
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.Description_tache.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "" || task.Status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box m="20px" marginTop={10} marginLeft={-10}>
      <Typography variant="h4" gutterBottom>
        Mes Tâches
      </Typography>

      {/* Barre de recherche */}
      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          variant="outlined"
          placeholder="Rechercher par description..."
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            width: "300px",
            marginRight: "16px",
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch color="#000" />
              </InputAdornment>
            ),
          }}
        />

        {/* Status filter */}
        <FormControl variant="outlined" sx={{ width: "200px" }}>
          <InputLabel id="status-filter-label">Filtrer par état</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Filtrer par état"
            sx={{ background: "rgba(255, 255, 255, 0.8)", borderRadius: "10px" }}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="Nouveau">Nouveau</MenuItem>
            <MenuItem value="En cours">En cours</MenuItem>
            <MenuItem value="Terminée">Terminée</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box height={300} mt={3} width={1100}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredTasks}
            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
            columns={columns}
            pageSize={5}
            getRowId={(row) => row.Id_tache}
            autoHeight
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                color: "#000",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              },
              "& .MuiDataGrid-cell": {
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              },
              "& .status-en-cours": {
                backgroundColor: "yellow",
                color: "#000",
              },
              "& .status-terminee": {
                backgroundColor: "green",
                color: "#fff",
              },
              "& .status-nouveau": {
                backgroundColor: "blue",
                color: "#fff",
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default TacheUtilisateur;
