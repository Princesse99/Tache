// src/components/TableauDeBord.jsx

import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { FaTasks, FaClock, FaSpinner,FaCheckCircle  } from 'react-icons/fa';
// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const TableauDeBord = () => {
  // State for task counts
  const [taskCounts, setTaskCounts] = useState({
    totalTaches: 0,
    tachesEnCours: 0,
    tachesTerminees: 0,
    tachesEnAttente: 0,
  });

  // State for charts data
  const [donneesBarres, setDonneesBarres] = useState({});
  const [donneesBeignet, setDonneesBeignet] = useState({});

  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch task counts and chart data on component mount
  useEffect(() => {
    fetchTaskCounts();
    fetchChartData();
  }, []);

  // Function to fetch task counts
  const fetchTaskCounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/taskCounts');
      setTaskCounts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching task counts:', err);
      setError('Failed to fetch task counts.');
      setLoading(false);
    }
  };

  // Function to fetch data for charts
  const fetchChartData = async () => {
    try {
      // Example API calls for chart data
      // Replace these with your actual endpoints and data processing as needed

      // Fetch data for bar chart
      const barResponse = await axios.get('http://localhost:3000/api/barChartData'); // Example endpoint
      setDonneesBarres(barResponse.data);

      // Fetch data for doughnut chart
      const donutResponse = await axios.get('http://localhost:3000/api/doughnutChartData'); // Example endpoint
      setDonneesBeignet(donutResponse.data);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      // Handle errors if necessary
    }
  };

  // Example data setup if API endpoints for charts are not available
  useEffect(() => {
    // Sample data for bar chart
    const barData = {
      labels: ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Auot', 'Septembre', 'Octobre', 'Novembre','Decembre'],
      datasets: [
        {
          label: 'Nouveau',
          backgroundColor: '#34d399',
          data: [0, 48, 32, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          label: 'En attente',
          backgroundColor: '#3b82f6',
          data: [0, 0, 0, 0, 0, 0, 55, 60, 36, 31, 0],
        },
        {
          label: 'En cours',
          backgroundColor: '#f59e0b',
          data: [0, 0, 0, 0, 0, 38, 0, 0, 48, 32, 0],
        },
        {
          label: 'Terminee',
          backgroundColor: '#ef4444',
          data: [0, 0, 0, 0, 0, 0, 55, 60, 36, 31, 0],
        },
      ],
    };

    // Sample data for doughnut chart
    const donutData = {
      labels: ['Nouveau', 'En attente', 'En cours', 'Terminee'],
      datasets: [
        {
          data: [254, 99, 243, 101],
          backgroundColor: ['#34d399', '#3b82f6', '#f59e0b', '#ef4444'],
          hoverBackgroundColor: ['#10b981', '#2563eb', '#d97706', '#dc2626'],
        },
      ],
    };

    setDonneesBarres(barData);
    setDonneesBeignet(donutData);
  }, []);

  // Chart options
  const optionsBarres = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 70,
      },
    },
  };

  const optionsBeignet = {
    maintainAspectRatio: false,
  };

  return (
    <div className="p-4 w-screen max-w-screen-lg">
      <h2 className="text-3xl font-bold mb-6">Tableau de Bord</h2>

     
      {loading ? (
        <p>Chargement des données...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Indicateurs principaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white text-black p-6 rounded shadow-lg">
              <h3 className="text-lg font-semibold">Total Tâches</h3>
            < FaTasks  className="mr-2"/>  <p className="text-2xl font-bold">{taskCounts.totalTaches}</p>
            </div>
            <div className="bg-white text-black p-6 rounded shadow-lg">
              <h3 className="text-lg font-semibold">Tâches En Attente</h3>
              <  FaClock  className="mr-2"/>  <p className="text-2xl font-bold">{taskCounts.tachesEnAttente}</p>
            </div>
            <div className="bg-white text-black p-6 rounded shadow-lg">
              <h3 className="text-lg font-semibold">Tâches En Cours</h3>
              <  FaSpinner  className="mr-2"/>  <p className="text-2xl font-bold">{taskCounts.tachesEnCours}</p>
            </div>
            <div className="bg-white text-black p-6 rounded shadow-lg">
              <h3 className="text-lg font-semibold">Tâches Terminées</h3>
              < FaCheckCircle className="mr-2"/>  <p className="text-2xl font-bold">{taskCounts.tachesTerminees}</p>
            </div>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique à barres */}
            <div className="bg-white p-6 rounded shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Statistique</h3>
              <div style={{ height: '400px' }}>
                <Bar data={donneesBarres} options={optionsBarres} />
              </div>
            </div>

            {/* Graphique en beignet */}
            <div className="bg-white p-6 rounded shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Statistique status par jour</h3>
              <div style={{ height: '400px' }}>
                <Doughnut data={donneesBeignet} options={optionsBeignet} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TableauDeBord;
