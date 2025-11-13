import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TutorResources: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Resources</h1>
      <Card>
        <CardHeader>
          <CardTitle>Teaching Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Resources management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorResources;
