import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import axios from 'axios';

function Utilisateur() {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        id: '',
        nom: '',
        email: '',
        mot_passe: '',
        image: '',
        role: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const tableRef = useRef(null);

    useEffect(() => {
        axios.get('http://localhost:3000/api/utilisateurs')
            .then(response => {
                setUtilisateurs(response.data);
            })
            .catch(error => console.error('Error fetching utilisateurs:', error));
    }, []);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const handleOpenModal = (utilisateur = { id: '', nom: '', email: '', mot_passe: '', image: '', role: '' }) => {
        setCurrentUser({
            id: utilisateur.ID || '',
            nom: utilisateur.Nom || '',
            email: utilisateur.Email || '',
            mot_passe: utilisateur.Mot_Passe || '',
            image: utilisateur.Image ? `http://localhost:3000${utilisateur.Image}` : '',
            role: utilisateur.Role || ''
        });
        setImageFile(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentUser({
            id: '',
            nom: '',
            email: '',
            mot_passe: '',
            image: '',
            role: ''
        });
        setImageFile(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setCurrentUser(prevState => ({
                ...prevState,
                image: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!currentUser.nom || !currentUser.email || !currentUser.mot_passe || !currentUser.role) {
            alert("Veuillez remplir tous les champs");
            return;
        }

        const formData = new FormData();
        formData.append('nom', currentUser.nom);
        formData.append('email', currentUser.email);
        formData.append('mot_passe', currentUser.mot_passe);
        formData.append('role', currentUser.role);
        if (imageFile) formData.append('image', imageFile);

        const requestUrl = currentUser.id
            ? `http://localhost:3000/api/utilisateurs/${currentUser.id}`
            : 'http://localhost:3000/api/utilisateurs';

        axios({
            method: currentUser.id ? 'put' : 'post',
            url: requestUrl,
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(response => {
            if (response.data.error) {
                alert('Erreur lors de l\'opération');
            } else {
                if (currentUser.id) {
                    const updatedUtilisateurs = utilisateurs.map(utilisateur =>
                        utilisateur.ID === currentUser.id ? { ...response.data, image: response.data.image || utilisateur.image } : utilisateur
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
        .catch(error => console.error('Error:', error));
    };

    const handleDeleteUtilisateur = (id) => {
        axios.delete(`http://localhost:3000/api/utilisateurs/${id}`)
            .then(response => {
                if (response.data.error) {
                    alert('Erreur lors de la suppression de l\'utilisateur');
                } else {
                    setUtilisateurs(utilisateurs.filter(utilisateur => utilisateur.ID !== id));
                }
            })
            .catch(error => console.error('Error:', error));
    };

    const scrollToUtilisateur = (utilisateurId) => {
        if (tableRef.current) {
            const utilisateurRow = tableRef.current.querySelector(`tr[data-id='${utilisateurId}']`);
            if (utilisateurRow) {
                utilisateurRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };
    


    const filteredUtilisateurs = utilisateurs.filter(utilisateur => utilisateur.Nom && utilisateur.Nom.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="container mx-auto mt-20 px-4 -ml-20 w-screen max-w-screen-lg">
            <div className=" text-center py-4  mb-4 w-screen max-w-screen-lg">
                <h1 className="text-2xl font-semibold text-black">Liste des Utilisateurs Enregistrés</h1>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
                <div className="flex items-center border border-gray-300 rounded">
                    <FaSearch className="text-gray-500 mr-2 ml-3" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full bg-transparent outline-none p-2 text-gray-700"
                    /> 
                </div>
                <button 
                   className="bg-cyan-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded flex items-center"
                    onClick={handleOpenModal}
                >
                    <FaPlus className="mr-2" /> Ajouter Utilisateur
                </button>
            </div>

<div className="bg-white shadow overflow-hidden border-b border-gray-200 rounded-lg">
  <table ref={tableRef} className="min-w-full divide-y divide-gray-200">
    <thead className="bg-cyan-500">
      <tr>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nom</th>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Mot de Passe</th>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Profile</th>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role</th>
        <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200 ">
      {filteredUtilisateurs.map((utilisateur) => (
        <tr key={utilisateur.ID} data-id={utilisateur.ID}>
          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{utilisateur.Nom}</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{utilisateur.Email}</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{utilisateur.Mot_Passe}</td>
          <td className="px-4 py-2 whitespace-nowrap text-center">
            {utilisateur.Image && (
              <img
                src={`http://localhost:3000${utilisateur.Image}`}
                alt={utilisateur.Nom}
                className="h-10 w-10 object-cover rounded-full mx-auto"
              />
            )}
          </td>
          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{utilisateur.Role}</td>
          <td className="px-2 py-2 whitespace-nowrap text-sm font-medium flex justify-center">
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded mr-2 hover:bg-blue-700 transition duration-200 ease-in-out"
              onClick={() => handleOpenModal(utilisateur)}
            >
              <FaEdit />
            </button>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-200 ease-in-out"
              onClick={() => handleDeleteUtilisateur(utilisateur.ID)}
            >
              <FaTrash />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                        <h2 className="text-2xl font-bold mb-4">{currentUser.id ? 'Modifier' : 'Ajouter'} Utilisateur</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700">Nom</label>
                                <input
                                    type="text"
                                    value={currentUser.nom}
                                    onChange={(e) => setCurrentUser({ ...currentUser, nom: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={currentUser.email}
                                    onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Mot de Passe</label>
                                <input
                                    type="password"
                                    value={currentUser.mot_passe}
                                    onChange={(e) => setCurrentUser({ ...currentUser, mot_passe: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Profile</label>
                                <input type="file" onChange={handleImageChange} className="w-full" />
                                {currentUser.image && (
                                    <img
                                        src={currentUser.image}
                                        alt="Image Utilisateur"
                                        className="mt-2 h-20 w-20 object-cover rounded-full"
                                    />
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Role</label>
                                <input
                                    type="text"
                                    value={currentUser.role}
                                    onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="bg-cyan-500 text-white px-4 py-2 rounded"
                                >
                                    {currentUser.id ? 'Modifier' : 'Ajouter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Utilisateur;
