import React, { useState } from 'react';
import { Send, Paperclip, Image as ImageIcon, Link as LinkIcon, Video, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatWindowProps {
  conversationId: string;
}

const ChatWindow = ({ conversationId }: ChatWindowProps) => {
  const [message, setMessage] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);

  const conversationData: { [key: string]: any } = {
    '1': {
      tutorName: 'Sarah Johnson',
      tutorAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
      hasBooking: true,
      isOnline: true
    },
    '2': {
      tutorName: 'Carlos Rodriguez',
      tutorAvatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100',
      hasBooking: false,
      isOnline: false
    },
    '3': {
      tutorName: 'Marie Dubois',
      tutorAvatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=100',
      hasBooking: true,
      isOnline: true
    },
    '4': {
      tutorName: 'Hans Mueller',
      tutorAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
      hasBooking: false,
      isOnline: false
    }
  };

  const conversation = conversationData[conversationId];

  const messages = [
    {
      id: '1',
      senderId: 'tutor',
      content: 'Hello! Thanks for your interest in my English course. How can I help you today?',
      timestamp: '10:30 AM',
      type: 'text'
    },
    {
      id: '2',
      senderId: 'user',
      content: 'Hi! I would like to improve my English speaking skills. Do you have any courses for intermediate level?',
      timestamp: '10:32 AM',
      type: 'text'
    },
    {
      id: '3',
      senderId: 'tutor',
      content: 'Yes, I have a great intermediate conversation course. It focuses on real-life situations and practical vocabulary.',
      timestamp: '10:35 AM',
      type: 'text'
    },
    ...(conversation?.hasBooking ? [
      {
        id: '4',
        senderId: 'user',
        content: 'Sounds perfect! I just booked a session with you.',
        timestamp: '10:40 AM',
        type: 'text'
      },
      {
        id: '5',
        senderId: 'tutor',
        content: 'Great! Looking forward to our session. Here are some materials for you to review:',
        timestamp: '10:42 AM',
        type: 'text'
      },
      {
        id: '6',
        senderId: 'tutor',
        imageUrl: 'https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=400',
        content: 'English conversation topics',
        timestamp: '10:43 AM',
        type: 'image'
      },
      {
        id: '7',
        senderId: 'tutor',
        linkUrl: 'https://example.com/resources',
        content: 'Additional study materials',
        timestamp: '10:43 AM',
        type: 'link'
      }
    ] : [])
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar>
              <AvatarImage src={conversation?.tutorAvatar} alt={conversation?.tutorName} />
              <AvatarFallback>{conversation?.tutorName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            {conversation?.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{conversation?.tutorName}</h3>
            <p className="text-xs text-gray-500">{conversation?.isOnline ? 'Online' : 'Offline'}</p>
          </div>
          {conversation?.hasBooking && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Booked
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.senderId === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 shadow-sm'
              }`}
            >
              {msg.type === 'image' && msg.imageUrl && (
                <div className="mb-2">
                  <img
                    src={msg.imageUrl}
                    alt={msg.content}
                    className="rounded-lg max-w-full h-auto"
                  />
                </div>
              )}
              {msg.type === 'link' && msg.linkUrl && (
                <a
                  href={msg.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center space-x-2 p-2 rounded ${
                    msg.senderId === 'user' ? 'bg-blue-700' : 'bg-gray-100'
                  } hover:opacity-80 transition-opacity`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span className="text-sm underline">{msg.content}</span>
                </a>
              )}
              {msg.type === 'text' && <p>{msg.content}</p>}
              <p
                className={`text-xs mt-1 ${
                  msg.senderId === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        {!conversation?.hasBooking && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            Book a session to unlock image and link sharing features
          </div>
        )}

        <div className="flex items-end space-x-2">
          {conversation?.hasBooking && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAttachments(!showAttachments)}
              >
                <Paperclip className="w-5 h-5" />
              </Button>

              {showAttachments && (
                <div className="absolute bottom-full left-0 mb-2 bg-white shadow-lg rounded-lg p-2 space-y-1">
                  <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-100 rounded">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-sm">Send Image</span>
                  </button>
                  <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-100 rounded">
                    <LinkIcon className="w-4 h-4" />
                    <span className="text-sm">Send Link</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <Textarea
            placeholder={
              conversation?.hasBooking
                ? 'Type your message...'
                : 'Type your message (text only)...'
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 min-h-[44px] max-h-32 resize-none"
            rows={1}
          />

          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
