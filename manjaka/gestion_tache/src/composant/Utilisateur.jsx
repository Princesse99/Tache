import React, { useState, useEffect, useRef } from 'react';
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
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4 ">
                <h1 className="font-bold text-2xl text-black">Gestion Utilisateur</h1>
                <input
                    type="text"
                    placeholder="Rechercher par nom..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="p-2 border rounded"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => handleOpenModal()}>
                    Ajouter Utilisateur
                </button>
            </div>
            <div className='bg-white'>
                <table ref={tableRef} className="w-full border rounded">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2 text-center">Nom</th>
                            <th className="border px-4 py-2 text-center">Email</th>
                            <th className="border px-4 py-2 text-center">Mot de Passe</th>
                            <th className="border px-4 py-2 text-center">Image</th>
                            <th className="border px-4 py-2 text-center">Role</th>
                            <th className="border px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUtilisateurs.map(utilisateur => (
                            <tr key={utilisateur.ID} data-id={utilisateur.ID}>
                                <td className="border px-4 py-2 text-center">{utilisateur.Nom}</td>
                                <td className="border px-4 py-2 text-center">{utilisateur.Email}</td>
                                <td className="border px-4 py-2 text-center">{utilisateur.Mot_Passe}</td>
                                <td className="border px-4 py-2 text-center">
                                    {utilisateur.Image && (
                                        <img
                                            src={`http://localhost:3000${utilisateur.Image}`}
                                            alt={utilisateur.Nom}
                                            className="h-12 w-12 object-cover rounded-full bg-gray-600 mx-auto"
                                        />
                                    )}
                                </td>
                                <td className="border px-4 py-2 text-center">{utilisateur.Role}</td>
                                <td className="border px-4 py-2 text-center">
                                    <button className="bg-yellow-500 text-white px-2 py-1 rounded mr-2" onClick={() => handleOpenModal(utilisateur)}>
                                        Modifier
                                    </button>
                                    <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDeleteUtilisateur(utilisateur.ID)}>
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded">
                        <h2 className="text-lg font-bold mb-4">{currentUser.id ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block mb-2">Nom:</label>
                                <input
                                    type="text"
                                    value={currentUser.nom}
                                    onChange={e => setCurrentUser({ ...currentUser, nom: e.target.value })}
                                    className="border p-2 w-full"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Email:</label>
                                <input
                                    type="email"
                                    value={currentUser.email}
                                    onChange={e => setCurrentUser({ ...currentUser, email: e.target.value })}
                                    className="border p-2 w-full"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Mot de Passe:</label>
                                <input
                                    type="password"
                                    value={currentUser.mot_passe}
                                    onChange={e => setCurrentUser({ ...currentUser, mot_passe: e.target.value })}
                                    className="border p-2 w-full"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Role:</label>
                                <input
                                    type="text"
                                    value={currentUser.role}
                                    onChange={e => setCurrentUser({ ...currentUser, role: e.target.value })}
                                    className="border p-2 w-full"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Image:</label>
                                {currentUser.image && !imageFile && (
                                    <img
                                        src={currentUser.image}
                                        alt="User"
                                        className="h-24 w-24 object-cover mb-2"
                                    />
                                )}
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    className="border p-2 w-full"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button type="button" onClick={handleCloseModal} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">Annuler</button>
                                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
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
