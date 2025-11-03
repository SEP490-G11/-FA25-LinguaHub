import { GripVertical, Plus, Edit2, Trash2, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LessonData } from '../types';

interface LessonListProps {
  sectionTitle: string;
  lessons: LessonData[];
  onAddLesson: () => void;
  onEditLesson: (lesson: LessonData) => void;
  onDeleteLesson: (lessonId: number) => void;
  onReorderLessons: (lessons: LessonData[]) => void;
}

export function LessonList({
  sectionTitle,
  lessons,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: LessonListProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold mb-1">{sectionTitle}</h2>
        <p className="text-sm text-gray-500 mb-4">
          {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
        </p>
        <Button onClick={onAddLesson} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {lessons.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No lessons yet</p>
            <p className="text-sm mt-1">Add your first lesson to this section</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.LessonID}
                className="flex items-center gap-4 p-4 border rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <button className="cursor-grab hover:text-indigo-600">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </button>

                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 font-medium">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {lesson.LessonType === 'Video' ? (
                      <Video className="h-4 w-4 text-indigo-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-green-600" />
                    )}
                    <h3 className="font-medium truncate">{lesson.Title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{lesson.LessonType}</span>
                    <span>•</span>
                    <span>{lesson.Duration} minutes</span>
                    {lesson.Resources && lesson.Resources.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{lesson.Resources.length} resources</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onEditLesson(lesson)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => onDeleteLesson(lesson.LessonID!)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
