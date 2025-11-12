import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes.ts';

import LessonHeader from './components/sections/lesson-header';
import LessonContent from './components/sections/lesson-content';
import LessonSidebar from './components/sections/lesson-sidebar';

// ✅ Tự khai báo type Lesson
interface Lesson {
  id: string;
  title: string;
  week: number;
  duration: string;
  description: string;
  objectives: string[];
  materials: {
    id: string;
    title: string;
    type: string;
    size: string;
  }[];
  transcript: string;
  nextLesson?: {
    id: string;
    title: string;
    week: number;
  };
}

const LessonDetail = () => {
  //  chỉ lấy đúng param `id` từ route /lesson/:id
  const { id } = useParams();

  const [lesson, setLesson] = React.useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchLesson = async () => {

      //  param id phải tồn tại mới load mock lesson
      if (!id) return;

      try {
        setIsLoading(true);

        //  Mock data giữ nguyên như bạn muốn
        const mockLesson: Lesson = {
          id,
          title: 'Introduction to English Conversation',
          week: 1,
          duration: '15 minutes',
          description:
              'Learn the basics of English conversation including greetings, introductions, and common phrases.',
          objectives: [
            'Master basic greetings and introductions',
            'Learn common conversation starters',
            'Practice pronunciation of key phrases',
            'Understand cultural context in conversations',
          ],
          materials: [
            { id: '1', title: 'Conversation Practice Sheet', type: 'PDF', size: '2.5 MB' },
            { id: '2', title: 'Audio Pronunciation Guide', type: 'MP3', size: '5.2 MB' },
          ],
          transcript:
              'Hello and welcome to our English conversation course. In this lesson, we will cover the fundamentals of starting and maintaining conversations in English...',
          nextLesson: {
            id: '2',
            title: 'Small Talk Mastery',
            week: 2,
          },
        };

        setLesson(mockLesson);
      } catch (err) {
        setError('Failed to load lesson');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  //  Loading UI
  if (isLoading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Đang tải bài học...</p>
          </div>
        </div>
    );
  }

  //  Khi không tìm thấy bài học
  if (error || !lesson) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Không tìm thấy bài học</h2>
            <Button asChild>
              <Link to={ROUTES.HOME}>Về trang chủ</Link>
            </Button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background">
        {/*  Không còn truyền courseId */}
        <LessonHeader lesson={lesson} />

        <section className="py-8">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <LessonContent lesson={lesson} />
              <LessonSidebar lesson={lesson} />
            </div>
          </div>
        </section>
      </div>
  );
};

export default LessonDetail;
