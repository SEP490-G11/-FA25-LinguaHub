import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send } from 'lucide-react';

const TutorMessages: React.FC = () => {
  const messages = [
    { id: 1, student: 'John Doe', message: 'When is the next class?', time: '10 min ago', unread: true },
    { id: 2, student: 'Jane Smith', message: 'Thank you for the lesson!', time: '1 hour ago', unread: false },
    { id: 3, student: 'Mike Johnson', message: 'I need help with homework', time: '2 hours ago', unread: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">Communicate with your students</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                  msg.unread ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{msg.student}</h3>
                      {msg.unread && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{msg.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{msg.time}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorMessages;
