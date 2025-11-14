import { PendingCourse } from '@/queries/admin-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock, DollarSign, User, BookOpen, Award } from 'lucide-react';

interface CourseListProps {
  courses: PendingCourse[];
  onViewDetails: (course: PendingCourse) => void;
}

export function CourseList({
  courses,
  onViewDetails,
}: CourseListProps) {
  return (
    <div>
      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-blue-100 overflow-hidden flex flex-col group hover:border-blue-300"
          >
            {/* Course Thumbnail */}
            <div className="relative h-40 bg-gradient-to-br from-indigo-100 via-blue-50 to-cyan-100 overflow-hidden">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 brightness-95 group-hover:brightness-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-200 via-blue-100 to-cyan-200">
                  <BookOpen className="w-12 h-12 text-indigo-400 opacity-60" />
                </div>
              )}
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg flex items-center gap-1 px-3 py-1">
                  <Award className="w-3 h-3" />
                  Pending
                </Badge>
              </div>
            </div>

            {/* Course Content */}
            <div className="p-5 flex-1 flex flex-col">
              {/* Title */}
              <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 group-hover:text-indigo-700 transition-colors duration-200">
                {course.title}
              </h3>

              {/* Course Meta Info */}
              <div className="space-y-3 mb-4 flex-1">
                {/* Category & Language */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 transition-colors">
                    {course.category?.name || course.category_id}
                  </Badge>
                  {course.languages && course.languages[0] && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors">
                      {course.languages[0]}
                    </Badge>
                  )}
                </div>

                {/* Tutor Info - Education focused */}
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                  <User className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">Instructor</p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {course.tutor?.name || 'Unknown'}
                    </p>
                  </div>
                </div>

                {/* Duration & Price - Education themed */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-blue-600 font-semibold">Duration</p>
                      <p className="text-base font-bold text-gray-900">
                        {course.duration_hours}h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-green-100">
                    <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-green-600 font-semibold">Price</p>
                      <p className="text-base font-bold text-green-700">
                        ₫{(course.price_vnd / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                </div>

                {/* Created Date */}
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                  Submitted:{' '}
                  <span className="font-semibold text-gray-800">
                    {new Date(course.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </p>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => onViewDetails(course)}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg group/btn"
              >
                <Eye className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                Review Course
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
