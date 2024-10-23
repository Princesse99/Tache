import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Project } from 'react-gantt-chart';  // Ensure this library is correctly installed
import { CircularProgress, Box, Typography, Tooltip } from '@mui/material';

const GanttChart = ({ userId }) => {
  const [ganttData, setGanttData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const taskColors = {
    0: '#f44336',  // Red for critical or late tasks
    1: '#4caf50',  // Green for completed tasks
    2: '#2196f3',  // Blue for ongoing tasks
  };

  // Fetch Gantt data from the API
  const fetchGanttData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/tasks/gantt/${userId}`);
      if (Array.isArray(response.data)) {
        const formattedData = response.data.map((task) => {
          const startDate = task.Echeance_tache ? new Date(task.Echeance_tache) : null;
          const endDate = task.Date_Fin ? new Date(task.Date_Fin) : null;

          if (!startDate || isNaN(startDate.getTime()) || !endDate || isNaN(endDate.getTime())) {
            return null;  // Exclude tasks with invalid dates
          }

          return {
            id: task.Id_tache,
            name: task.Titre_tache || "Unnamed Task",
            start: startDate,
            end: endDate,
            status: task.Status || 0,  // Default status to 0 (critical)
            dependencies: task.dependencies || [],
            parentTaskId: task.parent_task_id || null,
            color: taskColors[task.Status || 0],  // Set task color based on status
          };
        }).filter(task => task !== null);  // Filter out invalid tasks

        setGanttData(formattedData);
      } else {
        setError("Unexpected data format received from the server.");
      }
    } catch (error) {
      setError("Failed to fetch Gantt data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGanttData();
  }, [userId]);

  return (
    <Box mt={5}>
      <Typography variant="h5" gutterBottom>Gantt Chart</Typography>
      <Box sx={{ height: '400px', backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography variant="body1" color="error">{error}</Typography>
        ) : ganttData.length > 0 ? (
          <Project
            data={ganttData}
            viewMode="Day"
            dependencies={true}
            taskColor={(task) => task.color}  // Set task color
            onTaskClick={(task) => console.log("Task clicked:", task)}
            parentTask={(task) => task.parentTaskId}
            renderTask={(task) => (
              <Tooltip title={`${task.name}\nStart: ${task.start}\nEnd: ${task.end}`}>
                <span style={{ backgroundColor: task.color }}>
                  {task.name}
                </span>
              </Tooltip>
            )}
          />
        ) : (
          <Typography variant="body1" color='#000'>No Gantt data available</Typography>
        )}
      </Box>
    </Box>
  );
};

export default GanttChart;
