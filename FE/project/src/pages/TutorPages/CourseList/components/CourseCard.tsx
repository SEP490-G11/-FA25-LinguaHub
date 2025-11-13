import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseListItem } from '../course-list-api';
import { getStatusConfig, formatPrice } from '../utils';

interface CourseCardProps {
  course: CourseListItem;
  index: number;
}

export const CourseCard = ({ course, index }: CourseCardProps) => {
  const statusConfig = getStatusConfig(course.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group border-2 hover:border-blue-200">
        {/* Course Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={course.thumbnailURL || '/placeholder-course.jpg'}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={`${statusConfig.className} border shadow-sm`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
          
          {/* Category Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              {course.categoryName}
            </Badge>
          </div>
        </div>

        <CardContent className="flex-1 flex flex-col p-5">
          {/* Course Header */}
          <div className="mb-4">
            <h3 className="font-bold text-xl text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {course.description}
            </p>
          </div>

          {/* Course Stats */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>Giá</span>
              </div>
              <span className="font-bold text-blue-600 text-base">
                {formatPrice(course.price)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Thời lượng</span>
              </div>
              <span className="font-medium">{course.duration} giờ</span>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span>Ngôn ngữ</span>
              </div>
              <span className="font-medium text-xs">{course.language}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-auto">
            <Button
              asChild
              variant="default"
              size="sm"
              className="w-full group/btn"
            >
              <Link to={`/courses/${course.id}/content`}>
                <BookOpen className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                Quản lý nội dung
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
