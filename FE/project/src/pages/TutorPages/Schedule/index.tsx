import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TutorSchedule: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Schedule</h1>
      <Card>
        <CardHeader>
          <CardTitle>My Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Schedule management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorSchedule;
