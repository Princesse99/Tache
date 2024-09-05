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
        <div className="container mx-auto mt-5 px-4">
            <div className="text-center py-4 bg-gray-100 border-b border-gray-300">
                <h1 className="text-2xl font-semibold text-gray-800">Liste des Tâches Enregistrées</h1>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={handleAddTask}
                >
                    <FaPlus className="mr-2" /> Ajouter une tâche
                </button>
                <div className="flex flex-col md:flex-row items-center space- y-4 md:space-y-0 md:space-x-4">
                    <div className="flex items-center">
                        <FaSearch className="mr-2" />
                        <input
                            type="text"
                            placeholder="Rechercher par Titre..."
                            className="border rounded px-3 py-1"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="statusFilter" className="mr-2">Filtrer par Statut:</label>
                        <select
                            id="statusFilter"
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            className="border rounded px-3 py-1"
                        >
                            <option value="">Tous</option>
                            <option value="En cours">En cours</option>
                            <option value="Terminer">Terminer</option>
                            <option value="En attente">En attente</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border">Titre</th>
                            <th className="py-2 px-4 border">Description</th>
                            <th className="py-2 px-4 border">Échéance</th>
                            <th className="py-2 px-4 border">Statut</th>
                            <th className="py-2 px-4 border">Priorité</th>
                            <th className="py-2 px-4 border">Lieu</th>
                            <th className="py-2 px-4 border">Utilisateur</th>
                            <th className="py-2 px-4 border">Image</th>
                            <th className="py-2 px-4 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks
                            .filter(task =>
                                (task.Titre_tache.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                task.Description_tache.toLowerCase().includes(searchTerm.toLowerCase())) &&
                                (selectedStatus ? task.Status === selectedStatus : true)
                            )
                            .map(task => (
                                <tr key={task.Id_tache}>
                                    <td className="py-2 px-4 border">{task.Titre_tache}</td>
                                    <td className="py-2 px-4 border">{task.Description_tache}</td>
                                    <td className="py-2 px-4 border">{new Date(task.Echeance_tache).toLocaleDateString()}</td>
                                    <td className="py-2 px-4 border">{task.Status}</td>
                                    <td className="py-2 px-4 border">{task.Priorite}</td>
                                    <td className="py-2 px-4 border">{task.Lieu}</td>
                                    <td className="py-2 px-4 border">{task.ID}</td>
                                    <td className="py-2 px-4 border">
                                        {task.Image_utilisateur ? (
                                            <div className="flex items-center mt-2 text-xs md:text-sm">
                                                <img
                                                    src={`http://localhost:3000${task.Image_utilisateur}`}
                                                    alt={task.Nom_utilisateur}
                                                    className="w-6 h-6 rounded-full mr-2 md:w-8 md:h-8"
                                                />
                                            </div>
                                        ) : (
                                            <span>Pas d'image</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border">
                                        <button 
                                            className="text-blue-600 hover:text-blue-800 mr-2"
                                            onClick={() => handleEditTask(task)}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            className="text-red-600 hover:text-red-800"
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

            {showForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">{editTask ? "Modifier Tâche" : "Ajouter Tâche"}</h2>
                        <form>
                            <div className="mb-4">
                                <label className="block text-gray-700">Titre</label>
                                <input
                                    type="text"
                                    name="Titre_tache"
                                    value={newTask.Titre_tache}
                                    onChange={handleChange}
                                    className="border rounded px-3 py-1 w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Description</label>
                                <textarea
                                    name="Description_tache"
                                    value={newTask.Description_tache}
                                    onChange={handleChange}
                                    className="border rounded px-3 py-1 w-full"
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Échéance</label>
                                <input
                                    type="date"
                                    name="Echeance_tache"
                                    value={newTask.Echeance_tache}
                                    onChange={handleChange}
                                    className="border rounded px-3 py-1 w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Statut</label>
                                <select
                                    name="Status"
                                    value={newTask.Status}
                                    onChange={handleChange}
                                    className="border rounded px-3 py-1 w-full"
                                >
                                    <option value="">Choisir...</option>
                                    <option value="En cours">En cours</option>
                                    <option value="Terminer">Terminer</option>
                                    <option value="En attente">En attente</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Priorité</label>
                                <select
                                    name="Priorite"
                                    value={newTask.Priorite}
                                    onChange={handleChange}
                                    className="border rounded px-3 py-1 w-full"
                                >
                                    <option value="">Choisir...</option>
                                    {priorityOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Lieu</label>
                                <input
                                    type="text"
                                    name="Lieu"
                                    value={newTask.Lieu}
                                    onChange={handleChange}
                                    className="border rounded px-3 py-1 w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">ID Utilisateur</label>
                                <select
                                    name="ID"
                                    value={newTask.ID}
                                    onChange={handleChange}
                                    className="border rounded px-3 py-1 w-full"
                                >
                                    <option value="">Choisir...</option>
                                    {users.map(user => (
                                        <option key={user.ID} value={user.ID}>{user.ID}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSaveTask}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    {editTask ? "Enregistrer" : "Ajouter"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="ml-4 bg-gray-300 hover:bg-gray-500 text-gray-800 hover:text-white font-bold py-2 px-4 rounded"
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
