import React from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import api from "@/config/axiosConfig";
import { ROUTES } from "@/constants/routes";

import LessonHeader from "./components/sections/lesson-header";
import LessonContent from "./components/sections/lesson-content";
import LessonSidebar from "./components/sections/lesson-sidebar";


interface CourseResource {
  resourceID: number;
  resourceTitle: string;
  resourceType: string;
  size?: string;
  resourceURL: string;
}

interface CourseLesson {
  lessonID: number;
  title: string;
  orderIndex: number;
  duration: number;
  lessonType: string;
  content: string;
  objectives: string[];
  isDone: boolean;

  videoURL?: string | null;
  videoUrl?: string | null;
  video?: string | null;

  resources: CourseResource[];
}

interface CourseSection {
  sectionID: number;
  sectionTitle: string;
  lessons: CourseLesson[];
}

interface CourseDetailResponse {
  id: number;
  title: string;
  description?: string;
  section: CourseSection[];
}

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
  lessonType: string;

  description: string;
  objectives: string[];
  materials: LessonResource[];

  transcript: string;
  content?: string;

  videoURL: string | null;
  isDone: boolean;

  nextLesson?: {
    id: number;
    title: string;
    week: number;
  } | null;
}


const LessonDetail: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();

  // courseId luôn được parse thành number
  const [courseId] = React.useState<number | null>(
      location.state?.courseId ? Number(location.state.courseId) : null
  );

  const [lesson, setLesson] = React.useState<LessonData | null>(null);
  const [courseTitle, setCourseTitle] = React.useState<string>("");
  const [courseData, setCourseData] =
      React.useState<CourseDetailResponse | null>(null);

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
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
        const course: CourseDetailResponse = res.data.result;

        setCourseData(course);
        setCourseTitle(course.title);

        let foundLesson: CourseLesson | null = null;
        let nextLesson: CourseLesson | null = null;

        for (const sec of course.section) {
          const idx = sec.lessons.findIndex(
              (l) => l.lessonID.toString() === id
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

        const mappedMaterials: LessonResource[] = foundLesson.resources.map(
            (r) => ({
              id: r.resourceID,
              title: r.resourceTitle,
              type: r.resourceType,
              size: r.size || "Unknown",
              url: r.resourceURL,
            })
        );

        setLesson({
          id: foundLesson.lessonID,
          title: foundLesson.title,
          week: foundLesson.orderIndex,
          duration: foundLesson.duration,
          lessonType: foundLesson.lessonType,

          description: foundLesson.content,
          objectives: foundLesson.objectives,
          materials: mappedMaterials,

          transcript: foundLesson.content,
          content: foundLesson.content,

          videoURL:
              foundLesson.videoURL ||
              foundLesson.videoUrl ||
              foundLesson.video ||
              null,

          isDone: foundLesson.isDone,

          nextLesson: nextLesson
              ? {
                id: nextLesson.lessonID,
                title: nextLesson.title,
                week: nextLesson.orderIndex,
              }
              : null,
        });
      } catch {
        setError("Failed to load lesson.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [id, courseId]);


  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
    );
  }

  if (error || !lesson || !courseId || !courseData) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Không tìm thấy bài học</h2>
            <Button asChild>
              <Link to={ROUTES.HOME}>Về trang chủ</Link>
            </Button>
          </div>
        </div>
    );
  }


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
                initial={{opacity: 0, y: 60}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
            >
              <div className="lg:col-span-2">
                <LessonContent lesson={lesson} courseId={courseId}/>
              </div>


              {/* Truyền đúng dạng cho Sidebar */}
              <LessonSidebar
                  lesson={lesson}
                  course={{id: courseData.id}}
              />
            </motion.div>
          </div>
        </section>
      </div>
  );
};

export default LessonDetail;
