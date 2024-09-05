//////////////================================par manjaka============================//////////////////////////
import React, { useState, useEffect } from "react";
import { FaHome, FaTasks, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import { useNavigate, Link, Outlet } from "react-router-dom";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
const link = "http://localhost:3000";
const UtilisateurPanel = () => {
  const user = useAuthUser();
  const { image, nom, userId } = user;

  const signOut = useSignOut();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [taskCounts, setTaskCounts] = useState({
    totalTaches: 0,
    tachesEnCours: 0,
    tachesEnAttente: 0,
    tachesTerminees: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTaskCounts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/taskCounts?userId=${userId}`
        );
        setTaskCounts(response.data);
      } catch (error) {
        console.error("Error fetching task counts:", error);
      }
    };
    fetchTaskCounts();
  }, [userId]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLogout = () => {
    signOut();
    window.location.reload();
    navigate("/"); // Redirect to the login page
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`w-64 bg-cyan-500 text-white fixed top-0 left-0 h-full shadow-lg transition-transform duration-300 ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <h1 className="text-xl font-bold mb-6">Page Utilisateur</h1>
          <nav className="flex flex-col flex-grow">
            <Link
              to="/" // Update with your actual route
              className="flex items-center py-4 px-4 mb-2 rounded hover:bg-green-700"
            >
              <FaHome className="mr-2" /> Dashboard
            </Link>
            <Link
              to="/tasks" // Update with your actual route
              className="flex items-center py-4 px-4 mb-2 rounded hover:bg-green-700"
            >
              <FaTasks className="mr-2" /> Ma Tache
            </Link>
            <Link
              to="/profile" // Update with your actual route
              className="flex items-center py-4 px-4 rounded hover:bg-green-700"
            >
              <img
                src={
                  image
                    ? `http://localhost:3000${image}`
                    : "/path/to/default/profile/image.png"
                }
                alt="p"
                className="w-10 h-10 rounded-full border border-gray-300 mr-2"
                onError={(e) =>
                  (e.target.src = "/path/to/default/profile/image.png")
                }
              />
              Profile
            </Link>
          </nav>
          <footer className="mt-auto text-center">
            <button
              onClick={handleLogout}
              className="flex items-center py-4 px-4 mb-2 rounded w-full hover:bg-green-700 text-left"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
            <p className="mt-2">&copy; 2024 OrigamiTech</p>
          </footer>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 p-6 transition-all duration-300 ${
          isSidebarVisible ? "ml-64" : "ml-0"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className="text-2xl text-gray-700"
          >
            ☰
          </button>
        </div>
        <Outlet /> {/* This will render the nested routes */}
      </main>
    </div>
  );
};

export default UtilisateurPanel;
