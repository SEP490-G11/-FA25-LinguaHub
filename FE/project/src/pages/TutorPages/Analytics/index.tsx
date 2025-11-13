import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TutorAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Analytics dashboard will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorAnalytics;
