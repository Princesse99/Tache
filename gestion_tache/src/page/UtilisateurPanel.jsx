import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, Outlet } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Box,
  Typography,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  Home,
  TaskAlt,
  CalendarToday,
  AccountCircle,
  Logout,
  Menu as MenuIcon,
} from "@mui/icons-material";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import Swal from "sweetalert2";

const drawerWidth = 240;

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1C2237',
      paper: '#2A314A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9E9E9E',
    },
    primary: {
      main: '#14BDAC',
    },
    secondary: {
      main: '#F05E72',
    },
  },
});

const UtilisateurPanel = () => {
  const [taskCounts, setTaskCounts] = useState({
    totalTaches: 0,
    tachesEnCours: 0,
    tachesEnAttente: 0,
    tachesTerminees: 0,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const open = Boolean(anchorEl);
  const signOut = useSignOut();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");

  const user = {
    image: "profileImageURL", 
    nom: "Nom d'Utilisateur", 
    userId: 1 
  }; 

  useEffect(() => {
    const fetchTaskCounts = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/taskCounts?userId=${user.userId}`);
        setTaskCounts(response.data);
      } catch (error) {
        console.error("Error fetching task counts:", error);
      }
    };
    fetchTaskCounts();
  }, [user.userId]);

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
        signOut();
        navigate("/");
        window.location.reload(); // Optional page refresh
      }
    });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <Box
        sx={{
          
          // textAlign: "center",
          // color: 'white',
          // backdropFilter: 'blur(10px)',
          // borderRadius: '8px',
          // boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          // padding: '16px',
          // height:'900px'
        }}
      >
        <Avatar
          src={user.image ? `http://localhost:3000${user.image}` : "https://via.placeholder.com/80"}
          alt="Profile"
          sx={{ width: 80, height: 80, margin: "auto", mb: 2 }}
        />
        <Typography variant="h6">{user.Nom}</Typography>
        <List sx={{ color: 'white' }}>
          <ListItem button component={Link} to="/">
            <ListItemIcon>
              <Home sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Accueil" />
          </ListItem>
          <ListItem button component={Link} to="/tasks">
            <ListItemIcon>
              <TaskAlt sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Mes Tâches" />
          </ListItem>
          {/* <ListItem button component={Link} to="/gantt">
            <ListItemIcon>
              <CalendarToday sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Gantt" />
          </ListItem> */}
          <ListItem button component={Link} to="/calendrier">
            <ListItemIcon>
              <CalendarToday sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Calendrier" />
          </ListItem>
        </List>
        <Divider />
      </Box>
    </div>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', boxShadow: 'none' }}>
          <Toolbar>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap sx={{ flexGrow: 1, color: 'white' }}>
              Utilisateur 
            </Typography>
            <IconButton>
              <Badge badgeContent={taskCounts.totalTaches} color="error">
                <TaskAlt />
              </Badge>
            </IconButton>
            <IconButton edge="end" color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: { mt: 1.5, ml: 0.5, width: 200, "& .MuiMenuItem-root": { borderRadius: 1 } },
              }}
            >
              <MenuItem component={Link} to="/profile">
                <AccountCircle />
                <ListItemText primary="Profile" />
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout />
                <ListItemText primary="Se Déconnecter" />
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Drawer */}
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          <Toolbar />
          <Outlet /> {/* Content goes here */}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default UtilisateurPanel;
