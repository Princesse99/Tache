import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { format, parseISO } from "date-fns"; // Import parseISO to handle ISO date strings
import { Card, CardContent, IconButton, Typography, Stack, Button } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";

const Notification = () => {
  const [allNotifications, setAllNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/all-notification");
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
        alert("Notification marked as read.");
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd MMMM yyyy à HH:mm");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 600, mx: "auto", mt: 10 }}>
      {allNotifications.length > 0 ? (
        allNotifications.map((notification, index) => (
          <Card key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                {notification.message}
                <br />
                <Typography variant="caption" color="textSecondary">
                  le {formatDate(notification.Date)}
                </Typography>
              </Typography>
            </CardContent>
            <IconButton
              sx={{ color: 'blue' }}
              onClick={() => markAsRead(notification.Id_not)}
            >
              <FaEye />
            </IconButton>
          </Card>
        ))
      ) : (
        <Typography variant="body2" color="textSecondary" textAlign="center">
          No notifications available.
        </Typography>
      )}
    </Stack>
  );
};

export default Notification;
