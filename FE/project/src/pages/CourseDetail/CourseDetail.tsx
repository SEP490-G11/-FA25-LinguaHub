import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/config/axiosConfig.ts";
import CourseHeroSection from "./components/sections/hero-section";
import CourseContent from "./components/sections/course-content";
import CourseSidebar from "./components/sections/course-sidebar";
import CourseFeedback from "./components/sections/course-feedback";

interface LessonResource {
  resourceID: number;
  resourceType: string;
  resourceTitle: string;
  resourceURL: string;
  uploadedAt: string;
}

interface Lesson {
  lessonID: number;
  title: string;
  duration: number;
  lessonType: string;
  videoURL: string | null;
  content: string;
  orderIndex: number;
  createdAt: string;
  resources: LessonResource[];
}

interface Section {
  sectionID: number;
  courseID: number;
  title: string;
  description: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Feedback {
  feedbackID: number;
  userFullName: string;
  userAvatarURL: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface CourseDetailResponse {
  isPurchased: boolean | null;
  id: number;
  title: string;
  description: string;
  requirement: string;
  objectives: string[];
  duration: number;
  price: number;
  language: string;
  thumbnailURL: string;
  categoryName: string;
  tutorName: string;
  tutorAvatarURL: string | null;
  tutorAddress: string;
  avgRating: number;
  totalRatings: number;
  createdAt: string;
  tutorID: number;
  learnerCount: number;
  section: Section[];
  review: Feedback[];
  isWishListed: boolean | null;
  contentSummary: {
    totalVideoHours: number;
    totalPracticeTests: number;
    totalArticles: number;
    totalDownloadableResources: number;
  };
}

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<CourseDetailResponse | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get<{ code: number; result: CourseDetailResponse }>(
            `/courses/detail/${id}`
        );

        const data = res.data.result;
        setCourse(data);

        /** --- AUTO REMOVE WISHLIST WHEN PURCHASED --- */
        if (data.isPurchased) {
          await api.delete(`/wishlist/${data.id}`).catch(() => {});
          setWishlisted(false);
        } else {
          setWishlisted(Boolean(data.isWishListed));
        }
      } catch (error) {
        console.error("Failed to fetch course detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id]);

  if (loading)
    return <p className="text-center py-10 text-lg">Loading course...</p>;

  if (!course)
    return <p className="text-center py-10 text-red-500">Course not found</p>;

  return (
      <div className="min-h-screen bg-gray-50">

        {/* ================= HERO =================== */}
        <CourseHeroSection
            course={{
              ...course,
              isPurchased: Boolean(course.isPurchased),   // ép boolean
            }}
            wishlisted={wishlisted}
            setWishlisted={setWishlisted}
        />
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

              {/* LEFT CONTENT */}
              <div className="lg:col-span-2 space-y-10">
                <CourseContent course={course} isPurchased={course.isPurchased} />

                <CourseFeedback
                    feedbacks={course.review || []}
                    courseId={course.id}
                    isPurchased={Boolean(course.isPurchased)}
                />
              </div>

              {/* SIDEBAR */}
              <CourseSidebar
                  course={{
                    ...course,
                    isPurchased: Boolean(course.isPurchased),
                  }}
                  wishlisted={wishlisted}
                  setWishlisted={setWishlisted}
              />
            </div>
          </div>
        </section>
      </div>
  );
};

export default CourseDetail;
