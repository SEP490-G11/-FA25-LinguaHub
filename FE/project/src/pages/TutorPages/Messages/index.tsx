import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TutorMessages: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Messages</h1>
      <Card>
        <CardHeader>
          <CardTitle>Student Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Messaging system will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorMessages;
