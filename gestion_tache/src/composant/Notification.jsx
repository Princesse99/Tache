import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa"; // Import the check icon

const Notification = () => {
  const [all_notification, setAllNotification] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/all-notification"
      );
      if (response.status === 200) {
        setAllNotification(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const setRead = async (Id_not) => {
    try {
      const response = await axios.post("http://localhost:3000/api/set-read", {
        Id_not: Id_not,
      });
      if (response.status === 200) {
        alert("Notification deja vu.");
        fetchData();
      }
    } catch (error) {
      console.error("Error setting notification as read:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // Format to local date and time
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      {all_notification &&
        all_notification.map((n, index) => (
          <div
            key={index}
            className="flex flex-row justify-between items-center bg-white p-4 mb-4 rounded-lg shadow-md"
          >
            <p className="text-gray-700">
              {n.message} à la date {formatDate(n.date)}
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center"
              onClick={() => setRead(n.Id_not)}
            >
              <FaCheck className="text-white" />
            </button>
          </div>
        ))}
    </div>
  );
};

export default Notification;
