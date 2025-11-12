import React from 'react';
import { Star, MapPin, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface TutorInfoProps {
  tutor: {
    name: string;
    avatar: string;
    language: string;
    country: string;
    flag: string;
    rating: number;
    reviews: number;
    hourlyRate: number;
    specialties: string[];
  };
}

const TutorInfo = ({ tutor }: TutorInfoProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start space-x-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={tutor.avatar} alt={tutor.name} />
          <AvatarFallback>{tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h1 className="text-2xl font-bold">{tutor.name}</h1>
            <span className="text-2xl">{tutor.flag}</span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{tutor.country}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{tutor.rating}</span>
              <span className="text-gray-500">({tutor.reviews} reviews)</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-blue-600">${tutor.hourlyRate}/hour</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {tutor.specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorInfo;
