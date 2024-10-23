import React, { useState } from "react";
import axios from "axios";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { TextField, Button, Typography, Container, Box } from "@mui/material";

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const user = useAuthUser();
  const { email } = user;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await axios.put(
        "http://localhost:3000/api/admin/change-password",
        {
          email,
          currentPassword,
          newPassword,
        }
      );

      if (response.data.message) {
        setMessage(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue");
    }
  };

  return (
    <Container maxWidth="sm" sx={{marginLeft:'200px',marginTop:'10px'}}>
      <Box
        sx={{
          mt: 10,
          p: 4,
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", // Soft shadow for depth
          borderRadius: 4,
          bgcolor: "rgba(255, 255, 255, 0.25)", // Translucent white background
          backdropFilter: "blur(12px)", // Frosted glass effect
          border: "1px solid rgba(255, 255, 255, 0.18)", // Soft, subtle border
          position: "relative",
          overflow: "hidden",
          zIndex: 1, // Keeps content on top
        }}
      >
        <Typography variant="h4" align="center" gutterBottom color="#fff">
          Changer le mot de passe Admin
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Mot de passe actuel"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
            variant="outlined"
            sx={{ bgcolor: "rgba(255, 255, 255, 0.4)" }} // Slight background for input fields
          />

          <TextField
            label="Nouveau mot de passe"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
            variant="outlined"
            sx={{ bgcolor: "rgba(255, 255, 255, 0.4)" }} // Slight background for input fields
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, background: "#03dac5", borderRadius: "20px" }}
          >
            Confirmer
          </Button>
        </form>
        {error && (
          <Typography color="error" align="center" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        {message && (
          <Typography color="success" align="center" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default ChangePasswordForm;
