import React, { useState } from 'react';
import axios from 'axios';
import AdminPanel from './AdminPanel';
import UtilisateurPanel from './UtilisateurPanel';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const [userName, setUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password || !role) {
      setErrorMessage('Tous les champs doivent être remplis');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/login', { email, password, role });
      if (response.data.success) {
        setIsLoggedIn(true);
        setUserRole(response.data.role);
        setUserId(response.data.userId);
        setProfileImage(response.data.profileImage);
        setUserName(response.data.userName);
        setErrorMessage('');
      } else {
        setErrorMessage('Identifiants invalides');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  if (isLoggedIn) {
    const userProps = { userId, profileImage, userName };
    return userRole === 'Admin' ? <AdminPanel {...userProps} /> : <UtilisateurPanel {...userProps} />;
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-cyan-500">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md z-10">
        <img src="/logo.jpg" alt="OrigamiTech Logo" className="w-32 h-34 mx-auto mb-4" />
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="entrez email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de Passe</label>
          <input
            type="password"
            placeholder="entrez mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
          >
            <option value="">Selectionner le role</option>
            <option value="Admin">Admin</option>
            <option value="Utilisateur">Utilisateur</option>
          </select>
        </div>
        {errorMessage && (
          <div className="text-red-500 text-sm mt-2">
            {errorMessage}
          </div>
        )}
        <div className="flex justify-center">
          <button
            onClick={handleLogin}
            className="w-full rounded-md uppercase focus:outline-none font-bold hover:bg-cyan-600 focus:ring-2 ring-purple-300 bg-cyan-500 px-4 py-2 text-white"
          >
            Enregistrer
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,60 Q360,0 720,60 Q1080,120 1440,60 L1440,120 L0,120 Z" fill="#ffffff"></path>
        </svg>
      </div>
    </div>
  );
}

export default Login;
