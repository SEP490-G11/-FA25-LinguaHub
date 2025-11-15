import React from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes.ts";
import api from "@/config/axiosConfig";

import LessonHeader from "./components/sections/lesson-header";
import LessonContent from "./components/sections/lesson-content";
import LessonSidebar from "./components/sections/lesson-sidebar";

// Type Lesson FE sử dụng
interface Lesson {
  id: number;
  title: string;
  week: number;
  duration: string;
  description: string;
  objectives: string[];
  materials: {
    id: number;
    title: string;
    type: string;
    size: string;
    url: string;
  }[];
  transcript: string;
  nextLesson?: {
    id: number;
    title: string;
    week: number;
  } | null;
}

const LessonDetail = () => {
  const { id } = useParams(); // lessonId
  const location = useLocation();
  const courseId = location.state?.courseId; // lấy courseId từ navigate()

  const [lesson, setLesson] = React.useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchLesson = async () => {
      if (!id) return;
      if (!courseId) {
        setError("Missing courseId. Please go back from course page.");
        return;
      }

      try {
        setIsLoading(true);

        // gọi API lấy toàn bộ course detail
        const res = await api.get(`/courses/detail/${courseId}`);
        const course = res.data.result;

        let foundLesson: any = null;
        let nextLesson: any = null;

        // duyệt các section để tìm bài học
        for (const sec of course.section) {
          const index = sec.lessons.findIndex((l: any) => l.lessonID == id);
          if (index !== -1) {
            foundLesson = sec.lessons[index];
            nextLesson = sec.lessons[index + 1] || null;
            break;
          }
        }

        if (!foundLesson) {
          setError("Lesson not found in this course.");
          return;
        }

        // chuẩn hóa dữ liệu để FE dễ dùng
        setLesson({
          id: foundLesson.lessonID,
          title: foundLesson.title,
          week: foundLesson.orderIndex,
          duration: `${foundLesson.duration} minutes`,
          description: foundLesson.content,
          objectives: course.objectives || [], // course objectives
          materials:
              foundLesson.resources?.map((r: any) => ({
                id: r.resourceID,
                title: r.resourceTitle,
                type: r.resourceType,
                size: "Unknown",
                url: r.resourceURL,
              })) || [],
          transcript: foundLesson.content,
          nextLesson: nextLesson
              ? {
                id: nextLesson.lessonID,
                title: nextLesson.title,
                week: nextLesson.orderIndex,
              }
              : null,
        });
      } catch (err) {
        setError("Failed to load lesson.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [id, courseId]);

  // Loading UI
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

  // Khi lỗi hoặc không tìm thấy lesson
  if (error || !lesson) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Không tìm thấy bài học
            </h2>
            <Button asChild>
              <Link to={ROUTES.HOME}>Về trang chủ</Link>
            </Button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background">
        {/* truyền thêm courseId vào header */}
        <LessonHeader lesson={lesson} courseId={courseId} />

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
