import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Box,
  Button,
  TextField,
  Modal,
  Typography,
  IconButton,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { frFR } from "@mui/x-data-grid/locales";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500, 
  bgcolor: "background.paper",
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
};

const Utilisateur = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: "",
    nom: "",
    email: "",
    mot_passe: "",
    image: "",
    role: "",
    matricule: "", 
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    nom: true,
    email: true,
    mot_passe: true,
    image: true,
    role: true,
    matricule: true, 
  });
  const tableRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:3000/api/utilisateurs")
      .then((response) => {
        const rowsWithId = response.data.map((row) => ({
          id: row.ID,
          ...row,
        }));
        setUtilisateurs(rowsWithId);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        setLoading(false);
      });
  }, []);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleOpenModal = (
    utilisateur = {
      id: "",
      nom: "",
      email: "",
      mot_passe: "",
      image: "",
      role: "",
      matricule: "", 
    }
  ) => {
    setCurrentUser({
      id: utilisateur.id || "",
      nom: utilisateur.Nom || "",
      email: utilisateur.Email || "",
      mot_passe: utilisateur.Mot_Passe || "",
      image: utilisateur.Image
        ? `http://localhost:3000${utilisateur.Image}`
        : "",
      role: utilisateur.Role || "",
      matricule: utilisateur.Matricule || "", 
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentUser({
      id: "",
      nom: "",
      email: "",
      mot_passe: "",
      image: "",
      role: "",
      matricule: "", 
    });
    setImageFile(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setCurrentUser((prevState) => ({
        ...prevState,
        image: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !currentUser.nom ||
      !currentUser.email ||
      !currentUser.mot_passe ||
      !currentUser.role ||
      !currentUser.matricule 
    ) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const formData = new FormData();
    formData.append("nom", currentUser.nom);
    formData.append("email", currentUser.email);
    formData.append("mot_passe", currentUser.mot_passe);
    formData.append("role", currentUser.role);
    formData.append("matricule", currentUser.matricule); 
    if (imageFile) formData.append("image", imageFile);

    const requestUrl = currentUser.id
      ? `http://localhost:3000/api/utilisateurs/${currentUser.id}`
      : "http://localhost:3000/api/utilisateurs";

    axios({
      method: currentUser.id ? "put" : "post",
      url: requestUrl,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((response) => {
        if (response.data.error) {
          alert("Erreur lors de l'opération");
        } else {
          if (currentUser.id) {
            const updatedUtilisateurs = utilisateurs.map((utilisateur) =>
              utilisateur.id === currentUser.id
                ? {
                    ...response.data,
                    image: response.data.image || utilisateur.image,
                  }
                : utilisateur
            );
            setUtilisateurs(updatedUtilisateurs);
          } else {
            const newUser = { ...response.data, image: response.data.image };
            setUtilisateurs([...utilisateurs, newUser]);
          }
          handleCloseModal();
          scrollToUtilisateur(currentUser.id);
        }
      })
      .catch((error) => console.error("Erreur:", error));
  };

  const handleDeleteUtilisateur = (id) => {
    Swal.fire({
      title: "Supprimer l'utilisateur",
      text: "Voulez-vous vraiment supprimer cet utilisateur?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:3000/api/utilisateurs/${id}`)
          .then((response) => {
            if (response.data.error) {
              Swal.fire("Erreur", "Erreur lors de la suppression de l'utilisateur", "error");
            } else {
              setUtilisateurs(
                utilisateurs.filter((utilisateur) => utilisateur.id !== id)
              );
              Swal.fire("Supprimé", "L'utilisateur a été supprimé.", "success");
            }
          })
          .catch((error) => {
            console.error("Erreur:", error);
            Swal.fire("Erreur", "Erreur lors de la suppression de l'utilisateur", "error");
          });
      }
    });
  };

  const handleColumnVisibilityChange = (column) => {
    setColumnVisibility((prevState) => ({
      ...prevState,
      [column]: !prevState[column],
    }));
  };

  const scrollToUtilisateur = (utilisateurId) => {
    const row = utilisateurs.find((user) => user.id === utilisateurId);
    if (row) {
      const index = utilisateurs.indexOf(row);
      tableRef.current.scrollTo({ top: index * 48, behavior: "smooth" });
    }
  };

  const filteredUtilisateurs = utilisateurs.filter(
    (utilisateur) =>
      utilisateur.Nom &&
      utilisateur.Nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [ 
    { field: "Nom", headerName: "Nom", flex: 1, hide: !columnVisibility.nom },
    {
      field: "Email",
      headerName: "Email",
      flex: 1,
      hide: !columnVisibility.email,
    },
    {
      field: "Mot_Passe",
      headerName: "Mot de Passe",
      flex: 1,
      hide: !columnVisibility.mot_passe,
    },
    {
      field: "Matricule",
      headerName: "Matricule", 
      flex: 1,
      hide: !columnVisibility.matricule,
    },
    {
      field: "Image",
      headerName: "Profil",
      flex: 1,
      hide: !columnVisibility.image,
      renderCell: (params) =>
        params.value ? (
          <img
            src={`http://localhost:3000${params.value}`}
            alt={params.row.Nom}
            style={{ height: 40, width: 40, borderRadius: "50%" }}
          />
        ) : null,
    },
    {
      field: "Role",
      headerName: "Rôle",
      flex: 1,
      hide: !columnVisibility.role,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" >
         <IconButton onClick={() => handleOpenModal(params.row)}>
          <FaEdit className="text-gray-400" size={16} title="Modifier" />
        </IconButton>
        <IconButton onClick={() => handleDeleteUtilisateur(params.row.id)}>
          <FaTrash className="text-gray-400" size={16} title="Supprimer" />
        </IconButton>

        </Box>
      ),
    },
  ];

  return (
    <Box m="20px" marginTop='100px' marginLeft="90px">
      <Box 
      display="flex"
        mb="20px"
        p={2}
        sx={{
          backdropFilter: "blur(4px)",
          boxShadow: "0px 1px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
         marginLeft:'-80px'
        }}
      >
        <TextField
  variant="outlined"
  size="small"
  placeholder="Rechercher un utilisateur"
  value={searchTerm}
  onChange={handleSearchChange}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <FaSearch color="#fff" />
      </InputAdornment>
    ),
    sx: {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#fff",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#ffffff99",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#ffffffcc",
      },
    },
  }}
  sx={{
    borderRadius: '20px',
    color: "#fff",
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slight transparent background
    '& .MuiInputBase-input': {
      color: '#fff', // Input text color
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#fff',
      },
      '&:hover fieldset': {
        borderColor: '#ffffff99',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#ffffffcc',
      },
    },
    '&::placeholder': {
      color: '#ffffffcc', // Placeholder text color
    },
  }}
/>

        <Button
          variant="contained"
          color="primary"
          sx={{ marginLeft: "700px" }}
          startIcon={<FaPlus />}
          onClick={() => handleOpenModal()}
        >
          Ajouter Utilisateur
        </Button>
      </Box>

      {/* <Box
        display="flex"
        mb="20px"
        p={2}
        sx={{
          backdropFilter: "blur(4px)",
          boxShadow: "0px 1px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
        }}
      >
        {["nom", "email", "mot_passe", "image", "role", "matricule"].map(
          (column) => (
            <Button
              key={column}
              variant={columnVisibility[column] ? "contained" : "outlined"}
              color="primary"
              sx={{ marginLeft: "10px" }}
              onClick={() => handleColumnVisibilityChange(column)}
            >
              {column}
            </Button>
          )
        )}
      </Box> */}

      {loading ? (
        <CircularProgress />
      ) : (
        <Box height={400} ref={tableRef}>
          <DataGrid
            rows={filteredUtilisateurs}
            columns={columns}
            pageSize={5}
            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
            disableSelectionOnClick
            sx={{
              backdropFilter: "blur(10px)",
              background: "rgba(255, 255, 255, 0.8)",
              boxShadow: "0px 1px 10px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              width:'1250px',
              marginLeft:'-80px'
            }}
          />
        </Box>
      )}

      {/* Modal for Add/Edit User */}
      <Modal open={showModal} onClose={handleCloseModal}>
  <Box
    sx={{
      ...modalStyle,
      backgroundColor: "rgba(255, 255, 255, 0.1)", 
      backdropFilter: "blur(10px)", 
      borderRadius: "15px", 
      border: "1px solid rgba(255, 255, 255, 0.2)", 
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)", 
      padding: "20px", 
      width: "400px", 
      margin: "auto", 
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    }}
  >
    <Typography variant="h6" mb={2} color="#fff">
      {currentUser.id ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
    </Typography>
    <form onSubmit={handleSubmit}>
      <TextField
        margin="normal"
        fullWidth
        label="Nom"
        value={currentUser.nom}
        onChange={(e) =>
          setCurrentUser((prevState) => ({
            ...prevState,
            nom: e.target.value,
          }))
        }
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.2)", // Slight transparency on inputs
          borderRadius: "10px",
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.5)", // Light border for inputs
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.8)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#fff",
            },
          },
        }}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Email"
        value={currentUser.email}
        onChange={(e) =>
          setCurrentUser((prevState) => ({
            ...prevState,
            email: e.target.value,
          }))
        }
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "10px",
        }}
      />
      <TextField
        margin="normal"
        fullWidth
        type="password"
        label="Mot de Passe"
        value={currentUser.mot_passe}
        onChange={(e) =>
          setCurrentUser((prevState) => ({
            ...prevState,
            mot_passe: e.target.value,
          }))
        }
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "10px",
          '&::placeholder': {
         color: '#ffffffcc', // Placeholder text color
        },
        }}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Matricule"
        value={currentUser.matricule}
        onChange={(e) =>
          setCurrentUser((prevState) => ({
            ...prevState,
            matricule: e.target.value,
          }))
        }
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "10px",
          color:'#fff'
        }}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Role"
        value={currentUser.role}
        onChange={(e) =>
          setCurrentUser((prevState) => ({
            ...prevState,
            role: e.target.value,
          }))
        }
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "10px",
          color:'#fff'
        }}
      />
      <Box mt={2}>
        <Typography variant="body2" gutterBottom color="#fff">
          Image de Profil:
        </Typography>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {currentUser.image && (
          <img
            src={currentUser.image}
            alt="Profil"
            style={{
              marginTop: "10px",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "2px solid rgba(255, 255, 255, 0.5)", // Light border for the image
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)", // Adding shadow to the image
            }}
          />
        )}
      </Box>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" type="submit" sx={{background:'#03dac5'}}>
          {currentUser.id ? "Modifier" : "Ajouter"}
        </Button>
        <Button
          variant="outlined"
          color="#fff"
          onClick={handleCloseModal}
          sx={{ marginLeft: "10px",background:'#bb86fc',border:'1px solid #bb86fc',color:'#fff' }}
        >
          Annuler
        </Button>
      </Box>
    </form>
  </Box>
</Modal>

    </Box>
  );
};

export default Utilisateur;
