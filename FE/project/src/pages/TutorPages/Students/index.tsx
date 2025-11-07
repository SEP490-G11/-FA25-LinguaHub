import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TutorStudents: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Students</h1>
      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Students management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorStudents;
