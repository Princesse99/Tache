import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./page/Login";
import AdminPanel from "./page/AdminPanel";
import Notification from "./composant/Notification";
import Tache from "./composant/Tache";
import Utilisateur from "./composant/Utilisateur";
import TaskCalendar from "./composant/TaskCalendar";
import TacheUtilisateur from "./composant/TacheUtilisateur";
import ChangePasswordForm from "./composant/ChangePasswordForm";
import Dashboard from "./composant/Dashboard";
import UtilisateurPanel from "./page/UtilisateurPanel";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import DashboardUtilisateur from "./composant/DashboardUtilisateur";

function App() {
  const isAuthenticated = useIsAuthenticated();

  const user = useAuthUser();
  if (isAuthenticated) {
    if (user.isAdmin) {
      return (
        <div className="flex  gap-0 ">
          <div className="">
            <AdminPanel />
          </div>
          <div>
            <Routes>
              <Route path="" element={<Dashboard />} />
              <Route path="Tache" element={<Tache />} />
              <Route path="Utilisateur" element={<Utilisateur />} />
              <Route path="Notification" element={<Notification />} />
              <Route path="TaskCalendar" element={<TaskCalendar />} />
              <Route path="TacheUtilisateur" element={<TacheUtilisateur />} />
              <Route
                path="ChangePasswordForm"
                element={<ChangePasswordForm />}
              />
            </Routes>
          </div>
        </div>
      );
    }

    return (
      <div className="flex">
        <UtilisateurPanel />
        <Routes>
          <Route path="" element={<DashboardUtilisateur />} />
          <Route path="/tasks" element={<TacheUtilisateur />} />
          <Route
            path="/profile"
            element={<p>Pas encore de profil pour l'instant</p>}
          />
        </Routes>
      </div>
    );
  } else return <Login />;
}

export default App;
