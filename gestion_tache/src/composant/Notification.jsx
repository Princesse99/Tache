import axios from "axios";
import React, { useEffect, useState } from "react";
import {  FaEye } from "react-icons/fa";
import { format, parseISO } from "date-fns"; // Import parseISO to handle ISO date strings

const Notification = () => {
  const [allNotifications, setAllNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/all-notification"
      );
      if (response.status === 200) {
        setAllNotifications(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const response = await axios.post("http://localhost:3000/api/set-read", {
        Id_not: notificationId,
      });
      if (response.status === 200) {
        alert("Notification marquer deja vu.");
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatDate = (dateString) => {
    try {
      // Parse the ISO date string
      const date = parseISO(dateString);
      // Format the date
      return format(date, "dd MMMM yyyy à HH:mm");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date"; // Fallback if there's an error
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      {allNotifications.length > 0 ? (
        allNotifications.map((notification, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-white p-4 mb-4 rounded-lg shadow-md"
          >
            <p className="text-gray-700 font-light">
              {notification.message}{" "}
              <span className="text-gray-500">
                le {formatDate(notification.Date)}
              </span>
            </p>
            <button
              className="bg-cyan-500 hover:bg-blue-700 text-black font-semibold py-2 px-4 rounded flex items-center"
              onClick={() => markAsRead(notification.Id_not)}
            >
              <FaEye  />
            </button>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No notifications available.</p>
      )}
    </div>
  );
};

export default Notification;
