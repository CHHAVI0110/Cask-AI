import React from 'react';
import { 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Typography, 
  IconButton 
} from '@mui/material';
import { format } from 'date-fns';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MessageIcon from '@mui/icons-material/Message';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

interface NotificationItemProps {
  id: string;
  type: 'message' | 'system' | 'alert';
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
  data?: {
    patientDoctorId?: string;
    messageId?: string;
    [key: string]: any;
  };
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  title,
  content,
  timestamp,
  read,
  data,
  onMarkAsRead
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onMarkAsRead(id);
    
    // Navigate based on notification type
    if (type === 'message' && data?.patientDoctorId) {
      navigate(`/chat?id=${data.patientDoctorId}`);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'message':
        return <MessageIcon color="primary" />;
      default:
        return <NotificationsIcon color="primary" />;
    }
  };

  return (
    <ListItem 
      component="div"
      onClick={handleClick}
      className={`mb-1 rounded ${!read ? 'bg-blue-50' : ''}`}
      sx={{ cursor: 'pointer' }}
      secondaryAction={
        read ? (
          <IconButton edge="end" size="small" disabled>
            <CheckCircleIcon fontSize="small" color="disabled" />
          </IconButton>
        ) : null
      }
    >
      <ListItemAvatar>
        <Avatar className={!read ? 'bg-blue-500' : 'bg-gray-400'}>
          {getIcon()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="subtitle2" className="font-medium">
            {title}
          </Typography>
        }
        secondary={
          <React.Fragment>
            <Typography
              component="span"
              variant="body2"
              className="block"
            >
              {content}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              color="textSecondary"
            >
              {format(new Date(timestamp), 'MMM d, h:mm a')}
            </Typography>
          </React.Fragment>
        }
      />
    </ListItem>
  );
};

export default NotificationItem;