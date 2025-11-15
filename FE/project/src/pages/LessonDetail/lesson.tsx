import React from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import api from "@/config/axiosConfig";
import { ROUTES } from "@/constants/routes";

import LessonHeader from "./components/sections/lesson-header";
import LessonContent from "./components/sections/lesson-content";
import LessonSidebar from "./components/sections/lesson-sidebar";

interface LessonResource {
  id: number;
  title: string;
  type: string;
  size: string;
  url: string;
}

interface LessonData {
  id: number;
  title: string;
  week: number;
  duration: number;

  // ⭐⭐ QUAN TRỌNG — THÊM lessonType
  lessonType: "Video" | "Reading" | "Test" | string;

  description: string;
  objectives: string[];
  materials: LessonResource[];

  transcript: string;
  content?: string;

  videoURL: string | null;

  nextLesson?: {
    id: number;
    title: string;
    week: number;
  } | null;
}

const LessonDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const courseId = location.state?.courseId;

  const [lesson, setLesson] = React.useState<LessonData | null>(null);
  const [courseTitle, setCourseTitle] = React.useState<string>("");
  const [courseData, setCourseData] = React.useState<any>(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchLesson = async () => {
      if (!id) return;

      if (!courseId) {
        setError("Missing courseId. Please return from the course page.");
        return;
      }

      try {
        setIsLoading(true);

        const res = await api.get(`/courses/detail/${courseId}`);
        const course = res.data.result;

        setCourseData(course);
        setCourseTitle(course.title);

        let foundLesson: any = null;
        let nextLesson: any = null;

        // 🔎 Tìm bài học trong tất cả sections
        for (const sec of course.section) {
          const idx = sec.lessons.findIndex(
              (l: any) => l.lessonID == id || l.id == id
          );

          if (idx !== -1) {
            foundLesson = sec.lessons[idx];
            nextLesson = sec.lessons[idx + 1] || null;
            break;
          }
        }

        if (!foundLesson) {
          setError("Lesson not found in this course.");
          return;
        }

        // 🎬 Lấy video URL
        const extractedVideoUrl =
            foundLesson.videoURL ||
            foundLesson.videoUrl ||
            foundLesson.video_url ||
            foundLesson.video ||
            null;

        // 📄 Chuẩn hoá materials
        const mappedMaterials =
            foundLesson.resources?.map((r: any) => ({
              id: r.resourceID,
              title: r.resourceTitle,
              type: r.resourceType,
              size: r.size || "Unknown",
              url: r.resourceURL,
            })) || [];

        // ⭐⭐⭐ FIX CHÍNH — THÊM lessonType VÀ ĐẨY ĐÚNG TRƯỜNG
        setLesson({
          id: foundLesson.lessonID,
          title: foundLesson.title,
          week: foundLesson.orderIndex,
          duration: foundLesson.duration,

          // ✔ FIX TỐI QUAN TRỌNG
          lessonType: foundLesson.lessonType || "Reading",

          description: foundLesson.content || "",
          objectives: foundLesson.objectives || [],
          materials: mappedMaterials,

          transcript: foundLesson.content || "",
          content: foundLesson.content || "",

          videoURL: extractedVideoUrl,

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

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  // ============================= LOADING
  if (isLoading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading lesson...</p>
          </div>
        </div>
    );
  }

  // ============================= ERROR
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

  // ============================= MAIN RENDER
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <LessonHeader
            lesson={lesson}
            courseId={courseId}
            courseTitle={courseTitle}
        />

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                initial="initial"
                animate="animate"
                variants={fadeInUp}
            >
              {/* MAIN CONTENT */}
              <LessonContent lesson={lesson} />

              {/* SIDEBAR */}
              <LessonSidebar lesson={lesson} course={courseData} />
            </motion.div>
          </div>
        </section>
      </div>
  );
};

export default LessonDetail;
