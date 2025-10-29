import React, { useState, useEffect } from 'react';
import { 
  List, 
  Box, 
  Typography, 
  CircularProgress,
  Paper,
  Button
} from '@mui/material';
import NotificationItem from './NotificationItem';
import axios from 'axios';
import { API_URL } from '../../config';

interface Notification {
  _id: string;
  type: 'message' | 'system' | 'alert';
  title: string;
  content: string;
  createdAt: string;
  read: boolean;
  data?: {
    patientDoctorId?: string;
    messageId?: string;
    [key: string]: any;
  };
}

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(response.data.notifications || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Box className="flex justify-center items-center p-4">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} className="max-h-[500px] overflow-hidden">
      <Box className="p-3 bg-blue-50 border-b flex justify-between items-center">
        <Typography variant="h6">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </Typography>
        {unreadCount > 0 && (
          <Button 
            size="small" 
            onClick={handleMarkAllAsRead}
            variant="outlined"
          >
            Mark all as read
          </Button>
        )}
      </Box>
      
      <List className="overflow-y-auto" sx={{ maxHeight: '450px' }}>
        {notifications.length === 0 ? (
          <Box className="p-4 text-center text-gray-500">
            <Typography>No notifications</Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              id={notification._id}
              type={notification.type}
              title={notification.title}
              content={notification.content}
              timestamp={notification.createdAt}
              read={notification.read}
              data={notification.data}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        )}
      </List>
    </Paper>
  );
};

export default NotificationList;