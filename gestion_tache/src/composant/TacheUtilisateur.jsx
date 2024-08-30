import React, { useState, useEffect } from "react";
import axios from "axios";

const TacheUtilisateur = ({ userId }) => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/tasks/user/${userId}`
      );
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks for user:", error);
    }
  };
  useEffect(() => {
    fetchTasks();
  }, [userId]);
  const send_tache = async (tache) => {
    const { Id_tache, Description_tache } = tache;
    alert("execution");
    try {
      const response = await axios.post(
        `http://localhost:3000/api/create-notification`,
        {
          Id_tache: Id_tache,
          tache: Description_tache,
          utilisateur: "Sarobidy",
          date: new Date(),
          id_user: 114,
        }
      );
      console.log(response);
      if (response.status===200) {
        fetchTasks();
        // alert("Coucou sarobidy");
      }
    } catch (error) {
      console.error("There was an error sending the request:", error);
      alert("Failed to send request");
    }
  };
  
  return (
    <div className="container mx-auto mt-5 px-4">
      <h2 className="text-2xl font-semibold text-gray-800">Mes Tâches</h2>

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Titre</th>
              <th className="py-2 px-4 border">Description</th>
              <th className="py-2 px-4 border">Échéance</th>
              <th className="py-2 px-4 border">Statut</th>
              <th className="py-2 px-4 border">Priorité</th>
              <th className="py-2 px-4 border">Lieu</th>
              <th> Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.Id_tache}>
                <td className="py-2 px-4 border">{task.Titre_tache}</td>
                <td className="py-2 px-4 border">{task.Description_tache}</td>
                <td className="py-2 px-4 border">
                  {new Date(task.Echeance_tache).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border">{task.Status}</td>
                <td className="py-2 px-4 border">{task.Priorite}</td>
                <td className="py-2 px-4 border">{task.Lieu}</td>
                <td className="mt-4 ">
                  <button
                    onClick={async () => await send_tache(task)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Valider
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TacheUtilisateur;
