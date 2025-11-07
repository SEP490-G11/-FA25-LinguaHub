import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, Download } from 'lucide-react';

const TutorResources: React.FC = () => {
  const resources = [
    { id: 1, name: 'English Grammar Guide.pdf', type: 'PDF', size: '2.5 MB', uploaded: '2024-11-01' },
    { id: 2, name: 'Spanish Vocabulary List.docx', type: 'DOCX', size: '1.2 MB', uploaded: '2024-10-28' },
    { id: 3, name: 'French Pronunciation Audio.mp3', type: 'MP3', size: '5.1 MB', uploaded: '2024-10-25' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600 mt-2">Manage your teaching materials and resources</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Upload className="h-4 w-4" />
          Upload Resource
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {resources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{resource.name}</h3>
                    <p className="text-sm text-gray-600">
                      {resource.type} • {resource.size} • Uploaded: {resource.uploaded}
                    </p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorResources;
