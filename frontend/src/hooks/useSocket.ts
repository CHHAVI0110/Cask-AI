import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

interface SocketMessage {
  type: string;
  data: any;
}

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!user?.id || !token) return;

    // Initialize socket connection
    const socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:8000', {
      auth: {
        token,
        userId: user.id,
        userRole: user.role
      }
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Message handlers
    socket.on('message', (message: SocketMessage) => {
      setLastMessage(message);
    });

    socket.on('typing', (data: { userId: string; username: string }) => {
      setTypingUsers(prev => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });
      
      // Remove user from typing list after 3 seconds
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(username => username !== data.username));
      }, 3000);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, token]);

  const sendMessage = useCallback((type: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message', { type, data });
    }
  }, [isConnected]);

  const emitTyping = useCallback((chatId: string) => {
    if (socketRef.current && isConnected && user) {
      socketRef.current.emit('typing', { 
        chatId, 
        userId: user.id,
        username: user.name
      });
    }
  }, [isConnected, user]);

  return {
    socket: socketRef.current,
    isConnected,
    lastMessage,
    typingUsers,
    sendMessage,
    emitTyping
  };
};