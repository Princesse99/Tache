// src/composant/Dashboard.js
import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Example Stats */}
        <div className="bg-white p-6 rounded shadow-lg">
          <h3 className="text-lg font-semibold">Total Tâches</h3>
          <p className="text-2xl">100</p>
        </div>
        <div className="bg-white p-6 rounded shadow-lg">
          <h3 className="text-lg font-semibold">Tâches En Cours</h3>
          <p className="text-2xl">25</p>
        </div>
        <div className="bg-white p-6 rounded shadow-lg">
          <h3 className="text-lg font-semibold">Tâches En Attente</h3>
          <p className="text-2xl">15</p>
        </div>
        <div className="bg-white p-6 rounded shadow-lg">
          <h3 className="text-lg font-semibold">Tâches Terminées</h3>
          <p className="text-2xl">60</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
