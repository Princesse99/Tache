import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './page/Login';
import AdminPanel from './page/AdminPanel';
import Notification from './composant/Notification';
import Tache from './composant/Tache';
import Utilisateur from './composant/Utilisateur';
import TaskCalendar from './composant/TaskCalendar';
import TacheUtilisateur from './composant/TacheUtilisateur';
import Dashboard from './composant/Dashboard';
import UtilisateurPanel from './page/UtilisateurPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/AdminPanel" element={<AdminPanel />}>
          <Route path="" element={<Dashboard />} />
          <Route path="Tache" element={<Tache />} />
          <Route path="Utilisateur" element={<Utilisateur />} />
          <Route path="Notification" element={<Notification />} />
          <Route path="TaskCalendar" element={<TaskCalendar />} />
          <Route path="TacheUtilisateur" element={<TacheUtilisateur />} />
        </Route>
        <Route path="/UtilisateurPanel" element={<UtilisateurPanel />}>
          <Route path="" element={<Dashboard />} />
          <Route path="TacheUtilisateur" element={<TacheUtilisateur />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
