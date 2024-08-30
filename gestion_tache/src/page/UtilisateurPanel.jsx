import React, { useState, useEffect } from 'react';
import { FaHome, FaTasks, FaSignOutAlt,  FaSearch } from 'react-icons/fa';
import TacheUtilisateur from '../composant/TacheUtilisateur';


import axios from 'axios';
import { useNavigate } from 'react-router-dom';




const UtilisateurPanel = ({ userId, profileImage, userName }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
        const response = await axios.get(`/api/taskCounts?userId=${userId}`);
        setTaskCounts(response.data);
      } catch (error) {
        console.error('Error fetching task counts:', error);
      }
    };
    fetchTaskCounts();
  }, [userId]);



   
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');  // Exemple 
    navigate('/');  // Redirect to the login page
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="mt-10 p-1">
            <header className="mb-2 flex items-center justify-between">
               <div>
                <h2 className="text-3xl font-bold mb-2 text-black">Bienvenue, {userName}</h2>
              </div>
              <div className="flex items-center">
                <div className="ml-2 flex items-center border border-gray-300 rounded">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="p-1 rounded-l w-48 text-xs"
                  />
                  <button className="bg-gray-200 p-1 rounded-r text-gray-600">
                    <FaSearch />
                  </button>
                </div>
              
                <div className="flex flex-col items-center mb-6 mt-8 text-center">
                  {profileImage ? (
                    <img 
                      src={`http://localhost:3000${profileImage}`} // Adjust the URL if necessary
                      alt="Profile"
                      style={{ width: '40px', height: '40px' }} // Inline styles for size
                      className="rounded-full mb-4 border border-gray-300"
                      onError={(e) => e.target.src = '/path/to/default/profile/image.png'} // Fallback image on error
                    />
                  ) : (
                    <img 
                      src="/path/to/default/profile/image.png" // Default image path if no profile image is provided
                      alt="Profile"
                      style={{ width: '80px', height: '80px' }} // Inline styles for size
                      className="rounded-full mb-4 border border-gray-300"
                    />
                  )}
                </div>
              </div>
            </header>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-8">
              <div className="col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Statistiques des Tâches</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  
                 
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold">Tâches En Cours</h3>
                    <div className="flex items-center">
                      <FaTasks className="text-yellow-500 text-2xl mr-2" />
                      <p className="text-yellow-500 text-2xl font-bold">{taskCounts.tachesEnCours}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold">Tâches En Attente</h3>
                    {/* Placeholder for tasks en attente */}
                    <p className="text-gray-600">{taskCounts.tachesEnAttente}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold">Tâches Terminées</h3>
                    {/* Placeholder for tasks terminées */}
                    <p className="text-gray-600">{taskCounts.tachesTerminees}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
      
      case 'tasks':
        return <TacheUtilisateur userId={userId} />;
     
      
      case 'logout':
        return <div>Déconnexion</div>;
      default:
        return <div>Select a menu item to see the content</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`w-64 bg-cyan-500 text-white fixed top-0 left-0 h-full shadow-lg transition-transform duration-300 ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col justify-between h-full">
          <div>
            <h1 className="text-xl font-bold mb-6 px-6">Page Utilisateur</h1>
            <nav>
              <button onClick={() => setActiveMenu('dashboard')} className="flex items-center  py-4 px-4 mb-2 rounded hover:bg-green-700 w-full text-left">
                <FaHome className="mr-2" /> Dashboard
              </button>
              <button onClick={() => setActiveMenu('tasks')} className="flex items-center py-4 px-4 mt-36 mb-2 rounded hover:bg-green-700 w-full text-left">
                <FaTasks className="mr-2" /> Ma Tache
              </button>
             
              
              
              <button onClick={handleLogout} className="flex items-center py-4 px-4 mb-2 mt-36 rounded hover:bg-green-700 w-full text-left">
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
            </nav>
          </div>
          <footer className="text-center">
          <button onClick={() => setActiveMenu('profile')} className="flex items-center py-4 px-4 mb-2 rounded hover:bg-green-700 w-full text-left">
                {/* Removed FaUser, profile image will be displayed */}
                {profileImage ? (
                  <img 
                    src={`http://localhost:3000${profileImage}`} // Adjust the URL if necessary
                    alt="Profile"
                    style={{ width: '40px', height: '40px' }} // Smaller size for sidebar
                    className="rounded-full mr-2 border border-gray-300"
                    onError={(e) => e.target.src = '/path/to/default/profile/image.png'} // Fallback image on error
                  />
                ) : (
                  <img 
                    src="/path/to/default/profile/image.png" // Default image path if no profile image is provided
                    alt="Profile"
                    style={{ width: '40px', height: '40px' }} // Smaller size for sidebar
                    className="rounded-full mr-2 border border-gray-300"
                  />
                )}
                Profile
              </button>
            <p>&copy; 2024 OrigamiTech</p>
          </footer>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 ml-64 p-6 transition-all duration-300 ${isSidebarVisible ? 'ml-64' : 'ml-0'}`}>
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="text-2xl text-gray-700">
            ☰
          </button>
        </div>
        <div>{renderContent()}</div>
      </main>
    </div>
  );
};

export default UtilisateurPanel;
