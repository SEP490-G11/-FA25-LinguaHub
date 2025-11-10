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
  duration: number;
  price: number;
  language: string;
  thumbnailURL: string;
  categoryName: string;
  tutorName: string;
  status: string;
  learnerCount: number;
  tutorAvatarURL: string;
  tutorAddress: string;
  avgRating: number;
  totalRatings: number;
  createdAt: string;

  section: Section[];
  feedbacks: Feedback[];

  isWishListed: boolean | null;
}

const CourseDetail = () => {
  const { id } = useParams();

  const [course, setCourse] = useState<CourseDetailResponse | null>(null);
  const [wishlisted, setWishlisted] = useState<boolean>(false);
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
        setWishlisted(Boolean(data.isWishListed));
      } catch (error) {
        console.error(" Failed to fetch course detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id]);

  if (loading) return <p className="text-center py-10 text-lg">Loading course...</p>;
  if (!course) return <p className="text-center py-10 text-red-500">Course not found</p>;
  return (
      <div className="min-h-screen bg-gray-50">

        {/* wishlisted & setWishlisted xuống Hero */}
        <CourseHeroSection
            course={course}
            wishlisted={wishlisted}
            setWishlisted={setWishlisted}
        />
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-10">
                <CourseContent course={course} isPurchased={course.isPurchased} />
                <CourseFeedback
                    feedbacks={course.feedbacks}
                    courseId={course.id}
                    isPurchased={Boolean(course.isPurchased)}
                />
              </div>
              <CourseSidebar
                  course={course}
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
