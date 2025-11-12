import React from 'react';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

interface ConversationsListProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
}

const ConversationsList = ({ selectedConversation, onSelectConversation }: ConversationsListProps) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const conversations = [
    {
      id: '1',
      tutorName: 'Sarah Johnson',
      tutorAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'Great! Looking forward to our session.',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      hasBooking: true,
      isOnline: true
    },
    {
      id: '2',
      tutorName: 'Carlos Rodriguez',
      tutorAvatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'Would you like to schedule a trial lesson?',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      hasBooking: false,
      isOnline: false
    },
    {
      id: '3',
      tutorName: 'Marie Dubois',
      tutorAvatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'Thank you for booking!',
      lastMessageTime: '3 hours ago',
      unreadCount: 1,
      hasBooking: true,
      isOnline: true
    },
    {
      id: '4',
      tutorName: 'Hans Mueller',
      tutorAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'I can help you with German grammar',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      hasBooking: false,
      isOnline: false
    }
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.tutorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedConversation === conversation.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={conversation.tutorAvatar} alt={conversation.tutorName} />
                  <AvatarFallback>{conversation.tutorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {conversation.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm truncate">{conversation.tutorName}</h3>
                  <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                {conversation.hasBooking && (
                  <div className="mt-1">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Booked
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationsList;
