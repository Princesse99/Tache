import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  FaHome,
  FaTasks,
  FaUser,
  FaBell,
  FaSignOutAlt,
  FaCalendar,
  FaUserCircle,
  FaMoon,
  FaCog 
} from "react-icons/fa";
import { useNavigate, Link, Outlet } from "react-router-dom";
// maka le signout fonction
import useSignOut from "react-auth-kit/hooks/useSignOut";

const socket = io("http://localhost:3001");

const AdminPanel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [taskCounts, setTaskCounts] = useState({
    totalTaches: 0,
    tachesEnCours: 0,
    tachesEnAttente: 0,
    tachesTerminees: 0,
  });
  const [notifications, setNotifications] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/all-notification"
      );
      if (response.status === 200) {
        setNotificationCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTaskCounts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/taskCounts"
        );
        setTaskCounts(response.data);
      } catch (error) {
        console.error("Error fetching task counts:", error);
      }
    };
    fetchTaskCounts();
  }, []);

  useEffect(() => {
    socket.on("notification-received", (data) => {
      setNotifications((prev) => [
        ...prev,
        `Notification de l'utilisateur ${data.userId}: ${data.message}`,
      ]);
    });

    return () => {
      socket.off("notification-received");
    };
  }, []);

  // ========initialisation d'une instance de signout===============//
  const signOut = useSignOut();

  const handleLogout = () => {
    signOut();
    window.location.reload();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-1/2 bg-black">
      
      {/* Sidebar */}
      <aside
        className={`w-64 bg-cyan-500 text-black fixed top-0 left-0 h-full shadow-lg`}
      >
        <div className="p-6 flex flex-col justify-between h-full">
          <div>
            <h1 className="text-xl font-bold mb-6 px-6">OrigamiTech</h1>
            <nav>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 mb-4 rounded text-gray-800"
              />
              <Link
                to="/"
                className="flex items-center py-4 px-4 mb-2 rounded hover:bg-green-700 w-full text-left "
              >
                <FaHome className="mr-2" /> Dashboard
              </Link>
              <Link
                to="/Utilisateur"
                className="flex items-center py-4 px-4 mb-2 rounded hover:bg-green-700 w-full text-left "
              >
                <FaUser className="mr-2" /> Utilisateur
              </Link>
              <Link
                to="/Tache"
                className="flex items-center py-4 px-4 mb-2 rounded hover:bg-green-700 w-full text-left"
              >
                <FaTasks className="mr-2" /> Tâches
              </Link>
              <Link
                to="/Notification"
                className="relative flex items-center py-4 px-4 mb-2 rounded hover:bg-green-700 w-full text-left"
              >
                <FaBell className="mr-2 text-2xl" />
                <p className="absolute -top-1 -right-1 bg-red-600 text-black font-bold text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
                  {notificationCount}
                </p>
                Notifications
              </Link>
              <Link
                to="/TaskCalendar"
                className="flex items-center py-4 px-4 mb-2 rounded hover:bg-green-700 w-full text-left"
              >
                <FaCalendar className="mr-2" /> Calendrier
              </Link>
              <Link
                to="/ChangePasswordForm"
                className="flex items-center py-4 px-4 mb-2 rounded hover:bg-green-700 w-full text-left"
              >
                <FaUserCircle className="mr-2" /> Compte
              </Link>
            </nav>
          </div>
          {/* <div className="flex space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <FaMoon className="text-gray-800 dark:text-gray-200" size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" >
            <FaCog className="text-gray-800 dark:text-gray-200" size={20} />
          </button>
        </div> */}
          <button
            onClick={handleLogout}
            className="flex items-center py-4 px-4 mb-2 rounded hover:bg-red-700 w-full text-left"
          >
            <FaSignOutAlt className="mr-2" /> Se Déconnecter
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10 transition-transform duration-300 ml-64 ">
        <Outlet />
        
      </main>

    </div>
  );
};

export default AdminPanel;
