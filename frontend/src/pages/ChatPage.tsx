import React, { useState } from 'react';
import { Container, Box, Typography } from '@mui/material';
import ChatList from '../components/chat/ChatList';
import ChatBox from '../components/chat/ChatBox';
import { useAuth } from '../hooks/useAuth';

const ChatPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<{
    id: string;
    name: string;
    image?: string;
  } | null>(null);
  const { user } = useAuth();

  const handleSelectChat = (id: string, name: string, image?: string) => {
    setSelectedChat({ id, name, image });
  };

  return (
    <Container maxWidth="xl" className="h-full py-4">
      <Typography variant="h4" className="mb-4">
        {user?.role === 'doctor' ? 'Patient Conversations' : 'Doctor Conversations'}
      </Typography>
      
      <Box component="div" className="grid grid-cols-12 gap-3 h-[calc(100vh-180px)]">
        {/* Chat list sidebar */}
        <Box component="div" className="col-span-12 md:col-span-4 lg:col-span-3 h-full">
          <ChatList 
            onSelectChat={handleSelectChat}
            selectedChatId={selectedChat?.id}
          />
        </Box>
        
        {/* Chat area */}
        <Box component="div" className="col-span-12 md:col-span-8 lg:col-span-9 h-full">
          {selectedChat ? (
            <ChatBox 
              patientDoctorId={selectedChat.id}
              recipientName={selectedChat.name}
              recipientImage={selectedChat.image}
            />
          ) : (
            <Box 
              className="h-full flex items-center justify-center bg-gray-50 rounded-lg border"
            >
              <Typography variant="h6" color="textSecondary">
                Select a conversation to start chatting
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ChatPage;