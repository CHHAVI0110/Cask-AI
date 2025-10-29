import React from 'react';
import { Avatar } from '@mui/material';
import { format } from 'date-fns';

interface ChatMessageProps {
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  senderName: string;
  senderImage?: string;
  isRead: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  timestamp,
  isCurrentUser,
  senderName,
  senderImage,
  isRead
}) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
        <Avatar 
          src={senderImage || undefined} 
          alt={senderName}
          className={`h-8 w-8 ${isCurrentUser ? 'ml-2' : 'mr-2'}`}
        >
          {senderName.charAt(0).toUpperCase()}
        </Avatar>
        <div>
          <div className={`
            px-4 py-2 rounded-lg 
            ${isCurrentUser 
              ? 'bg-blue-500 text-white rounded-tr-none' 
              : 'bg-gray-200 text-gray-800 rounded-tl-none'}
          `}>
            <p className="text-sm">{content}</p>
          </div>
          <div className={`flex text-xs text-gray-500 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <span>{format(new Date(timestamp), 'h:mm a')}</span>
            {isCurrentUser && (
              <span className="ml-2">
                {isRead ? 'Read' : 'Delivered'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;