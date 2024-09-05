import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function Tache() {
    const [showForm, setShowForm] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [newTask, setNewTask] = useState({
        Titre_tache: "",
        Description_tache: "",
        Echeance_tache: "",
        Status: "",
        Priorite: "",
        Lieu: "",
        ID: ""
    });
    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(""); // Filter status
    const [users, setUsers] = useState([]);

    // Priority options
    const priorityOptions = ["Faible", "Moyenne", "Élevée"];

    useEffect(() => {
        axios.get('http://localhost:3000/api/tasks')
            .then(response => {
                setTasks(response.data);
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
            });
    }, []);

    useEffect(() => {
        axios.get('http://localhost:3000/api/utilisateurs')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }, []);

    const handleChange = (e) => {
        setNewTask({
            ...newTask,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddTask = () => {
        setShowForm(true);
        setEditTask(null);
        setNewTask({
            Titre_tache: "",
            Description_tache: "",
            Echeance_tache: "",
            Status: "",
            Priorite: "",
            Lieu: "",
            ID: ""
        });
    };

    const handleSaveTask = async () => {
        try {
            let response;
            if (editTask) {
                response = await axios.put(`http://localhost:3000/api/tasks/${editTask.Id_tache}`, newTask);
                setTasks(tasks.map(task => task.Id_tache === editTask.Id_tache ? response.data : task));
            } else {
                if (!newTask.ID) {
                    console.error('Error: ID utilisateur manquant');
                    return;
                }
                response = await axios.post('http://localhost:3000/api/tasks', newTask);
                setTasks([...tasks, response.data]);

                // Notify user via Socket.io
                socket.emit('task-assigned', {
                    userId: newTask.ID,
                    taskId: response.data.Id_tache,
                    message: `Vous avez une nouvelle tâche assignée: ${newTask.Titre_tache}`
                });
            }
        } catch (error) {
            console.error('Error saving task:', error);
        }
        setShowForm(false);
        setNewTask({
            Titre_tache: "",
            Description_tache: "",
            Echeance_tache: "",
            Status: "",
            Priorite: "",
            Lieu: "",
            ID: ""
        });
    };

    const handleEditTask = (task) => {
        setShowForm(true);
        setEditTask(task);
        setNewTask(task);
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`http://localhost:3000/api/tasks/${taskId}`);
            setTasks(tasks.filter(task => task.Id_tache !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };

    return (
        <div className="container mx-auto mt-20 -ml-20 px-4 w-screen max-w-screen-lg">
            <div className="text-center py-4 mb-4 w-screen max-w-screen-lg">
                <h1 className="text-2xl font-semibold text-black">Liste des Tâches Enregistrées</h1>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0 mt-9">
                <button
                    className="bg-cyan-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded flex items-center"
                    onClick={handleAddTask}
                >
                    <FaPlus className="mr-2" /> Ajouter une tâche
                </button>
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex items-center border border-gray-300 rounded">
                        <FaSearch className="text-gray-500 mr-2 ml-3" />
                        <input
                            type="text"
                            placeholder="Rechercher par Titre..."
                            className="border-0 outline-none px-3 py-2 w-full"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="flex items-center border border-gray-300 rounded">
                        <label htmlFor="statusFilter" className="text-gray-700 mr-2">Filtrer par Statut:</label>
                        <select
                            id="statusFilter"
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            className="border-0 outline-none px-3 py-2"
                        >
                            <option value="">Tous</option>
                            <option value="En cours">En cours</option>
                            <option value="Terminer">Terminer</option>
                            <option value="En attente">En attente</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden border-b border-gray-200  rounded-lg">
                <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-cyan-500">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Titre</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Échéance</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Statut</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Priorité</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Lieu</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Utilisateur</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Image</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tasks
                                .filter(task =>
                                    (task.Titre_tache.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    task.Description_tache.toLowerCase().includes(searchTerm.toLowerCase())) &&
                                    (selectedStatus ? task.Status === selectedStatus : true)
                                )
                                .map(task => (
                                    <tr key={task.Id_tache}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{task.Titre_tache}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{task.Description_tache}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{new Date(task.Echeance_tache).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{task.Status}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{task.Priorite}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{task.Lieu}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{task.ID}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {task.Image_utilisateur ? (
                                                <div className="flex items-center mt-2 text-xs md:text-sm">
                                                    <img
                                                        src={`http://localhost:3000${task.Image_utilisateur}`}
                                                        alt={task.Nom_utilisateur}
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">Pas d'image</span>
                                            )}
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            <button 
                                                className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700"
                                                onClick={() => handleEditTask(task)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                onClick={() => handleDeleteTask(task.Id_tache)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
               <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-2xl font-semibold mb-4">{editTask ? 'Modifier la Tâche' : 'Ajouter une Tâche'}</h2>
                        <form>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="Titre_tache">Titre</label>
                                <input
                                    type="text"
                                    id="Titre_tache"
                                    name="Titre_tache"
                                    value={newTask.Titre_tache}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded w-full py-2 px-3 text-sm leading-tight focus:outline-none"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="Description_tache">Description</label>
                                <textarea
                                    id="Description_tache"
                                    name="Description_tache"
                                    value={newTask.Description_tache}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded w-full py-2 px-3 text-sm leading-tight focus:outline-none"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="Echeance_tache">Échéance</label>
                                <input
                                    type="date"
                                    id="Echeance_tache"
                                    name="Echeance_tache"
                                    value={newTask.Echeance_tache}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded w-full py-2 px-3 text-sm leading-tight focus:outline-none"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="Status">Statut</label>
                                <select
                                    id="Status"
                                    name="Status"
                                    value={newTask.Status}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded w-full py-2 px-3 text-sm leading-tight focus:outline-none"
                                >
                                    <option value="">Sélectionner</option>
                                    <option value="En cours">En cours</option>
                                    <option value="Terminer">Terminer</option>
                                    <option value="En attente">En attente</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="Priorite">Priorité</label>
                                <select
                                    id="Priorite"
                                    name="Priorite"
                                    value={newTask.Priorite}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded w-full py-2 px-3 text-sm leading-tight focus:outline-none"
                                >
                                    <option value="">Sélectionner</option>
                                    {priorityOptions.map(priority => (
                                        <option key={priority} value={priority}>{priority}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="Lieu">Lieu</label>
                                <input
                                    type="text"
                                    id="Lieu"
                                    name="Lieu"
                                    value={newTask.Lieu}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded w-full py-2 px-3 text-sm leading-tight focus:outline-none"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="ID">Utilisateur</label>
                                <select
                                    id="ID"
                                    name="ID"
                                    value={newTask.ID}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded w-full py-2 px-3 text-sm leading-tight focus:outline-none"
                                >
                                    <option value="">Sélectionner</option>
                                    {users.map(user => (
                                        <option key={user.ID} value={user.ID}>{user.ID}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSaveTask}
                                    className="bg-cyan-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    {editTask ? 'Enregistrer les modifications' : 'Ajouter la Tâche'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-4"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tache;
