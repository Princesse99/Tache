import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Card, CardContent, Typography, Avatar, Button, Modal } from "@mui/material";
import Slider from "react-slick"; 
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Swal from "sweetalert2"; // Import SweetAlert2

const ProfileUser = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // State to hold the selected user
  const [open, setOpen] = useState(false); // State to manage modal open/close

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/utilisateurs")
      .then((response) => {
        const rowsWithId = response.data.map((row) => ({
          id: row.ID,
          ...row,
        }));
        setUtilisateurs(rowsWithId);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      });
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const handleOpenModal = (utilisateur) => {
    setSelectedUser(utilisateur);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  // Handle user deletion
  const handleDeleteUser = (id) => {
    Swal.fire({
      title: "Supprimer l'utilisateur",
      text: "Voulez-vous vraiment supprimer cet utilisateur?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer!",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:3000/api/utilisateurs/${id}`)
          .then(() => {
            setUtilisateurs(utilisateurs.filter(user => user.id !== id));
            Swal.fire("Supprimé!", "L'utilisateur a été supprimé.", "success");
          })
          .catch((error) => {
            console.error("Erreur lors de la suppression de l'utilisateur:", error);
            Swal.fire("Erreur!", "Une erreur est survenue lors de la suppression.", "error");
          });
      }
    });
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "16px", backdropFilter: "blur(10px)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)", maxWidth: "1200px", margin: "0 auto", marginTop: '80px', }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", textAlign: "center", color: "#fff" }}>
        Liste des Utilisateurs
      </Typography>

      {/* User Slider */}
      <Slider {...settings}>
        {utilisateurs.map((utilisateur) => (
          <Box key={utilisateur.id} sx={{ padding: "0 15px" }}>
            <Card sx={{ borderRadius: "20px", background: "rgba(255, 255, 255, 0.2)", backdropFilter: "blur(15px)", color: "#fff", boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)", textAlign: "center", padding: 2, position: "relative", width: '250px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)', }, }}>
              <CardContent>
                <Avatar src={`http://localhost:3000${utilisateur.Image}`} alt={utilisateur.Nom} sx={{ width: 100, height: 100, marginBottom: 2, mx: "auto", border: '2px solid rgba(255, 255, 255, 0.5)' }} />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>{utilisateur.Nom}</Typography>
                <Typography variant="body2">{utilisateur.Email}</Typography>
                <Box mt={2} display="flex" justifyContent="center" gap={2}>
                  <Button variant="contained" sx={{ backgroundColor: "#03dac5", borderRadius: "20px", fontSize: "12px", width:"100px" }} onClick={() => handleOpenModal(utilisateur)}>Voir</Button>
                  <Button variant="contained" sx={{ backgroundColor: "#bb86fc", borderRadius: "20px", fontSize: "12px", }} onClick={() => handleDeleteUser(utilisateur.id)}>Supprimer</Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Slider>

      {/* User Detail Modal */}
      <Modal open={open} onClose={handleCloseModal} aria-labelledby="user-details-title" aria-describedby="user-details-description">
        <Box sx={{ ...modalStyle, bgcolor: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(15px)", borderRadius: '10px', padding: 3, boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', maxWidth: 400, margin: 'auto', }}>
          {selectedUser && (
            <>
              <Typography id="user-details-title" variant="h5" component="h2" sx={{ marginBottom: 2, textAlign: 'center', fontWeight: 'bold' }}>Détails de l'utilisateur</Typography>
              <Avatar src={`http://localhost:3000${selectedUser.Image}`} alt={selectedUser.Nom} sx={{ width: 100, height: 100, marginBottom: 2, mx: "auto", border: '2px solid rgba(0, 0, 0, 0.3)', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)', }} />
              <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 1 }}>{selectedUser.Nom}</Typography>
              <Typography variant="body1" sx={{ marginBottom: 1 }}>Email: {selectedUser.Email}</Typography>
              <Typography variant="body1" sx={{ marginBottom: 2 }}>Mot de Passe: {selectedUser.Mot_Passe}</Typography>
              <Typography variant="body1" sx={{ marginBottom: 1 }}>Matricule: {selectedUser.Matricule}</Typography>
              <Typography variant="body1" sx={{ marginBottom: 2 }}>Rôle: {selectedUser.Role}</Typography>
              <Button variant="contained" onClick={handleCloseModal} sx={{ marginTop: 2, bgcolor: '#194C7CFF', color: '#fff', '&:hover': { bgcolor: '#303f9f', }, borderRadius: '5px', width: '100%', }}>Fermer</Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default ProfileUser;
