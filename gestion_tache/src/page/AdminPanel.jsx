import React, { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Dashboard,
  InsertDriveFile,
  Person,
  ExpandLess,
  ExpandMore,
  ListAlt,
  CalendarToday,
  Home,
  AccountCircle,
  Logout,
} from "@mui/icons-material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { Link, useNavigate } from "react-router-dom";
import TableChartIcon from "@mui/icons-material/TableChart";
import ListIcon from "@mui/icons-material/List";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Swal from "sweetalert2"; // Import SweetAlert2
import axios from "axios";
import "./style.css";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import Badge from "@mui/material/Badge";
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#1C2237",
      paper: "#2A314A",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#9E9E9E",
    },
    primary: {
      main: "#14BDAC",
    },
    secondary: {
      main: "#F05E72",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

const AdminPanel = () => {
  const [openUtilisateur, setOpenUtilisateur] = useState(false);
  const [openTaches, setOpenTaches] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false); // Initialize mobileOpen state
  const navigate = useNavigate();
  const signout = useSignOut();
  const handleUtilisateurClick = () => {
    setOpenUtilisateur(!openUtilisateur);
  };

  const handleTachesClick = () => {
    setOpenTaches(!openTaches);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getAllNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/all-notification"
      );
      if (response.data.message) {
        const unreadNotifications = response.data.result.filter(
          (note) => !note.is_read
        );
        setCount(unreadNotifications.length);
        setNotifications(unreadNotifications);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleNotificationClick = async (notification) => {
    setSnackbarOpen(true);

    try {
      await axios.post("http://localhost:3000/api/set-read", {
        Id_not: notification.Id_not,
      });
      getAllNotifications();
    } catch (error) {
      console.log("Error marking notification as read:", error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    getAllNotifications();
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Se déconnecter?",
      text: "Voulez-vous vraiment vous déconnecter?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "OUI",
      cancelButtonText: "NON",
    }).then((result) => {
      if (result.isConfirmed) {
        // Add your signOut logic here, e.g., clear user session
        signout();
        navigate("/");
        window.location.reload();
      }
    });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="fixed" className="glass" sx={{ boxShadow: "none" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: "15px" }}>
            Admin
          </Typography>
          <Typography variant="body1">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>

          <IconButton color="inherit" onClick={() => setSnackbarOpen(true)}>
            <Badge
              badgeContent={count}
              color="error"
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              overlap="circular"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          {/* <IconButton color="inherit" onClick={toggleDarkMode}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton> */}
          {/* <Avatar alt="User" src="/path/to/profile.jpg" sx={{ ml: 2,color:'#ccc' }} /> */}
          <MenuItem onClick={handleLogout}>
            <Logout />
            <ListItemText />
          </MenuItem>
        </Toolbar>
      </AppBar>

      <div className="flex mt-5">
        <div className={`glass sidebar`}>
          <List sx={{ color: "white" }}>
            <ListItem button component={Link} to="/">
              <ListItemIcon>
                <Home sx={{ color: "#FFB5B5", fontSize: "20px" }} />
              </ListItemIcon>
              <ListItemText
                primary="Accueil"
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#fff",
                  "&:hover": {
                    color: "#03dac5",
                  },
                }}
              />
            </ListItem>

            <ListItem button onClick={handleUtilisateurClick}>
              <ListItemIcon>
                <Person sx={{ color: "#FFB5B5", fontSize: "20px" }} />
              </ListItemIcon>
              <ListItemText
                primary="Utilisateur"
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#fff",
                  "&:hover": {
                    color: "#03dac5",
                  },
                }}
              />
              {openUtilisateur ? (
                <ExpandLess sx={{ color: "white" }} />
              ) : (
                <ExpandMore sx={{ color: "white" }} />
              )}
            </ListItem>

            <Collapse in={openUtilisateur} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  button
                  component={Link}
                  to="/ProfileUser"
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    <Person sx={{ color: "#FFB5B5", fontSize: "20px" }} />
                  </ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItem>
                <ListItem
                  button
                  component={Link}
                  to="/Utilisateur"
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    <ListAlt sx={{ color: "#FFB5B5", fontSize: "20px" }} />
                  </ListItemIcon>
                  <ListItemText primary="Tableau" />
                </ListItem>
              </List>
            </Collapse>

            <ListItem button onClick={handleTachesClick}>
              <ListItemIcon>
                <InsertDriveFile sx={{ color: "#FFB5B5", fontSize: "20px" }} />
              </ListItemIcon>
              <ListItemText
                primary="Taches"
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#fff",
                  "&:hover": {
                    color: "#03dac5",
                  },
                }}
              />
              {openTaches ? (
                <ExpandLess sx={{ color: "white" }} />
              ) : (
                <ExpandMore sx={{ color: "white" }} />
              )}
            </ListItem>

            <Collapse in={openTaches} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button component={Link} to="/Tache" sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <TableChartIcon
                      sx={{ color: "#FFB5B5", fontSize: "20px" }}
                    />
                  </ListItemIcon>
                  <ListItemText primary="Table" />
                </ListItem>
                <ListItem
                  button
                  component={Link}
                  to="/TacheListe"
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    <ListIcon sx={{ color: "#FFB5B5", fontSize: "20px" }} />
                  </ListItemIcon>
                  <ListItemText primary="Liste" />
                </ListItem>
                <ListItem
                  button
                  component={Link}
                  to="/CadreTache"
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    <DashboardIcon
                      sx={{ color: "#FFB5B5", fontSize: "20px" }}
                    />
                  </ListItemIcon>
                  <ListItemText primary="Cadre" />
                </ListItem>
              </List>
            </Collapse>
            <ListItem
              button
              component={Link}
              to="/ChangePasswordForm"
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <ListAlt sx={{ color: "#FFB5B5", fontSize: "20px" }} />
              </ListItemIcon>
              <ListItemText primary="Compte" />
            </ListItem>
            <ListItem button component={Link} to="/TaskCalendar">
              <ListItemIcon>
                <CalendarToday sx={{ color: "#FFB5B5", fontSize: "20px" }} />
              </ListItemIcon>
              <ListItemText
                primary="Calendrier"
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#fff",
                  "&:hover": {
                    color: "#03dac5",
                  },
                }}
              />
            </ListItem>
          </List>
        </div>

        {/* Main Content */}
      </div>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="info"
          sx={{ width: "100%" }}
        >
          {notifications.length > 0
            ? notifications.map((note) => (
                <div
                  key={note.Id_not}
                  onClick={() => handleNotificationClick(note)}
                >
                  {note.message}
                </div>
              ))
            : "Aucune notification"}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default AdminPanel;
