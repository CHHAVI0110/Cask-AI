import React, { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Typography, 
  Badge, 
  Box,
  CircularProgress,
  Paper
} from '@mui/material';
import { format } from 'date-fns';
import chatService from '../../services/chatService';
import { useAuth } from '../../hooks/useAuth';

interface ChatItemProps {
  id: string;
  name: string;
  lastMessage?: string;
  lastActivity: string;
  unreadCount: number;
  profileImage?: string;
  onSelect: (id: string, name: string, image?: string) => void;
  isSelected: boolean;
}

const ChatItem: React.FC<ChatItemProps> = ({
  id,
  name,
  lastMessage,
  lastActivity,
  unreadCount,
  profileImage,
  onSelect,
  isSelected
}) => {
  return (
    <ListItem 
      component="div"
      onClick={() => onSelect(id, name, profileImage)}
      className={`mb-1 rounded ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
      sx={{ cursor: 'pointer' }}
    >
      <ListItemAvatar>
        <Badge
          color="primary"
          badgeContent={unreadCount}
          invisible={unreadCount === 0}
        >
          <Avatar src={profileImage}>
            {name.charAt(0).toUpperCase()}
          </Avatar>
        </Badge>
      </ListItemAvatar>
      <ListItemText
        primary={name}
        secondary={
          <React.Fragment>
            <Typography
              component="span"
              variant="body2"
              color="textPrimary"
              className="truncate block max-w-[180px]"
            >
              {lastMessage || 'No messages yet'}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              color="textSecondary"
            >
              {format(new Date(lastActivity), 'MMM d, h:mm a')}
            </Typography>
          </React.Fragment>
        }
      />
    </ListItem>
  );
};

interface ChatListProps {
  onSelectChat: (patientDoctorId: string, name: string, image?: string) => void;
  selectedChatId?: string;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        let response;
        if (user?.role === 'doctor') {
          response = await chatService.getDoctorChats();
        } else {
          response = await chatService.getPatientChats();
        }
        
        setChats(response.chats || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setLoading(false);
      }
    };

    fetchChats();
  }, [user]);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-full">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} className="h-full">
      <Box className="p-3 bg-blue-50 border-b">
        <Typography variant="h6">Conversations</Typography>
      </Box>
      
      <List className="overflow-y-auto" sx={{ maxHeight: 'calc(100vh - 180px)' }}>
        {chats.length === 0 ? (
          <Box className="p-4 text-center text-gray-500">
            <Typography>No conversations yet</Typography>
          </Box>
        ) : (
          chats.map((chat) => {
            const person = user?.role === 'doctor' ? chat.patient : chat.doctor;
            const name = `${person.firstName} ${person.lastName}`;
            const lastMessage = chat.lastMessage ? chat.lastMessage.content : '';
            
            return (
              <ChatItem
                key={chat.patientDoctorId}
                id={chat.patientDoctorId}
                name={name}
                lastMessage={lastMessage}
                lastActivity={chat.lastActivity}
                unreadCount={chat.unreadCount}
                profileImage={person.profileImage}
                onSelect={onSelectChat}
                isSelected={selectedChatId === chat.patientDoctorId}
              />
            );
          })
        )}
      </List>
    </Paper>
  );
};

export default ChatList;