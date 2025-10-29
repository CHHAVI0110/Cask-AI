import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Typography, Paper, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatMessage from './ChatMessage';
import chatService from '../../services/chatService';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  content: string;
  timestamp: string;
  read: boolean;
}

interface ChatBoxProps {
  patientDoctorId: string;
  recipientName: string;
  recipientImage?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ patientDoctorId, recipientName, recipientImage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  // Load chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await chatService.getChatHistory(patientDoctorId);
        setMessages(response.messages || []);
        setLoading(false);
        
        // Mark messages as read
        if (response.messages && response.messages.length > 0) {
          await chatService.markMessagesAsRead(patientDoctorId);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [patientDoctorId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Join the relationship room
    socket.emit('join_relationship', { relationshipId: patientDoctorId });

    // Listen for new messages
    socket.on('receive_message', (data: { patientDoctorId: string, message: Message }) => {
      if (data.patientDoctorId === patientDoctorId) {
        setMessages(prev => [...prev, data.message]);
        chatService.markMessagesAsRead(patientDoctorId);
      }
    });

    // Listen for typing indicators
    socket.on('typing_indicator', (data: { patientDoctorId: string, isTyping: boolean }) => {
      if (data.patientDoctorId === patientDoctorId) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing_indicator');
    };
  }, [socket, patientDoctorId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await chatService.sendMessage(patientDoctorId, newMessage);
      
      // Add the new message to the list
      setMessages(prev => [...prev, response.message]);
      
      // Clear the input
      setNewMessage('');
      
      // Emit the new message event to socket
      if (socket) {
        socket.emit('new_message', {
          patientDoctorId,
          messageId: response.message._id
        });
        
        // Clear typing indicator
        socket.emit('typing_end', { patientDoctorId });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing_start', { patientDoctorId });
      
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set new timeout
      const timeout = setTimeout(() => {
        socket.emit('typing_end', { patientDoctorId });
      }, 2000);
      
      setTypingTimeout(timeout);
    }
  };

  return (
    <Paper elevation={3} className="h-full flex flex-col">
      {/* Chat header */}
      <Box className="p-3 bg-blue-50 border-b">
        <Typography variant="h6">{recipientName}</Typography>
      </Box>
      
      {/* Messages area */}
      <Box className="flex-grow p-4 overflow-y-auto" sx={{ maxHeight: 'calc(100vh - 240px)' }}>
        {loading ? (
          <Box className="flex justify-center items-center h-full">
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box className="flex justify-center items-center h-full text-gray-500">
            <Typography>No messages yet. Start the conversation!</Typography>
          </Box>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message._id}
              content={message.content}
              timestamp={message.timestamp}
              isCurrentUser={message.sender._id === user?.id}
              senderName={`${message.sender.firstName} ${message.sender.lastName}`}
              senderImage={message.sender.profileImage}
              isRead={message.read}
            />
          ))
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <Box className="text-gray-500 text-sm italic">
            {recipientName} is typing...
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Message input */}
      <Box className="p-3 border-t flex">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          onInput={handleTyping}
          size="small"
        />
        <IconButton 
          color="primary" 
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="ml-2"
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatBox;