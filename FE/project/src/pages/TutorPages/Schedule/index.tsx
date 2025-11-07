import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

const TutorSchedule: React.FC = () => {
  const sessions = [
    { id: 1, student: 'John Doe', course: 'English for Beginners', date: '2024-11-08', time: '10:00 AM', status: 'confirmed' },
    { id: 2, student: 'Jane Smith', course: 'Advanced Spanish', date: '2024-11-08', time: '2:00 PM', status: 'confirmed' },
    { id: 3, student: 'Mike Johnson', course: 'French Basics', date: '2024-11-09', time: '9:00 AM', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
        <p className="text-gray-600 mt-2">Manage your teaching schedule and sessions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{session.student}</h3>
                    <p className="text-sm text-gray-600">{session.course}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {session.date} at {session.time}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    session.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorSchedule;
