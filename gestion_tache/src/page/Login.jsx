import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  SvgIcon,
} from "@mui/material";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useNavigate } from "react-router-dom";

function Login() {
  const [matricule, setMatricule] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigator = useNavigate();
  const signIn = useSignIn();
  const handleLogin = async () => {
    if (!matricule || !password) {
      setErrorMessage("Tous les champs doivent être remplis");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3000/api/authentification",
        {
          matricule,
          password,
        }
      );
      if (response.data.success) {
        const user = response.data.user;
        setErrorMessage("");
        signIn({
          auth: {
            token: response.data.token,
            type: "Bearer",
          },
          userState: {
            nom: user.Nom,
            userId: user.ID,
            isAdmin: user.Role === "Admin",
            email: user.Email,
            image: user.Image,
            password: user.Mot_Passe,
            matricule: user.Matricule,
          },
        });
        window.location.reload();
        navigator("/");
      } else {
        setErrorMessage("Identifiants invalides");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <Container
      maxWidth="xs"
      component="main"
      sx={{
        display: "flex",
        alignItems: "center",
        minHeight: "100vh",
        background: 'url("/path/to/your/background/image.jpg") no-repeat center center fixed',
        backgroundSize: "cover",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: "24px",
          borderRadius: "20px",
          textAlign: "center",
          width: "100%",
          backdropFilter: "blur(10px)",
          background: "rgba(255, 255, 255, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
        }}
      >
        <img
          src="/logo.jpg"
          alt="OrigamiTech Logo"
          style={{
            width: 120,
            height: 120,
            marginBottom: 20,
            borderRadius: "50%",
            border: "2px solid rgba(255, 255, 255, 0.5)",
            marginLeft: "110px",
            marginTop: "-20px",
          }}
        />
        <Typography component="h1" variant="h5" style={{ fontSize: "15px", marginTop: "-20px", color: "#fff" }}>
          Se Connecter
        </Typography>

        <Box component="form" sx={{ mt: 3 }}>
          <TextField
            label="Matricule"
            variant="outlined"
            fullWidth
            margin="normal"
            type="text"
            value={matricule}
            onChange={(e) => setMatricule(e.target.value)}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(5px)",
              borderRadius: "10px",
            }}
          />
          <TextField
            label="Mot de Passe"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(5px)",
              borderRadius: "10px",
            }}
          />

          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3, mb: 2, bgcolor: "#3B8BC0FF", borderRadius: "10px" }}
            onClick={handleLogin}
          >
            Enregistrer
          </Button>
        </Box>
      </Paper>

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          overflow: "hidden",
          lineHeight: 0,
        }}
      >
        <SvgIcon viewBox="0 0 1440 120" sx={{ fill: "#ffffff" }}>
          <path d="M0,60 Q360,0 720,60 Q1080,120 1440,60 L1440,120 L0,120 Z" />
        </SvgIcon>
      </Box>
    </Container>
  );
}

export default Login;
