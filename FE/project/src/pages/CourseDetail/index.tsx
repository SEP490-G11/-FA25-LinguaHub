import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourseDetail } from "@/redux/slices/courseDetailSlice";
import { RootState, AppDispatch } from "@/redux/store";

import CourseHeroSection from "./components/sections/hero-section";
import CourseContent from "./components/sections/course-content";
import CourseSidebar from "./components/sections/course-sidebar";

const CourseDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const { course, loading } = useSelector((state: RootState) => state.courseDetail);

  useEffect(() => {
    if (id) dispatch(fetchCourseDetail(id));
  }, [dispatch, id]);

  if (loading) return <p className="text-center py-10 text-lg">Loading course...</p>;
  if (!course) return <p className="text-center py-10 text-red-500">Course not found</p>;

  /** ✅ Merge thêm mock data để tránh undefined */
  const courseWithContent = {
    ...course,

    // ✅ mock instructor (bắt buộc vì UI cần instructor.image)
    instructor: {
      name: course.tutorName ?? "Unknown Instructor",
      image: course.thumbnailURL, // tạm dùng thumbnail thay avatar tutor
      flag: "🌍",
      country: course.language, // gán language vào country luôn
      rating: 4.8,
      students: 1500,
      experience: "3 years",
    },

    // ✅ thêm mock cho UI
    level: "Beginner",
    lessons: 10,
    students: 2000,
    rating: 4.8,
    reviews: 132,
    originalPrice: course.price + 500000,
    image: course.thumbnailURL,

    // ✅ mock what you learn
    whatYouLearn: [
      "Understand IELTS Writing scoring system",
      "Improve structure and coherence",
      "Boost writing band score",
    ],

    // ✅ mock curriculum
    curriculum: [
      {
        week: 1,
        title: "Introduction to IELTS Writing",
        lessons: ["IELTS Overview", "Task 1 structure", "Task 2 structure"],
      },
      {
        week: 2,
        title: "Advanced Writing",
        lessons: ["Essay development", "Cohesion improvements", "Practice essay"],
      },
    ],

    // ✅ mock requirements
    requirements: [
      "Basic English knowledge",
      "Laptop or smartphone",
      "Stable internet connection",
    ],
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <CourseHeroSection course={courseWithContent} />

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <CourseContent course={courseWithContent} />
              <CourseSidebar course={courseWithContent} />
            </div>
          </div>
        </section>
      </div>
  );
};

export default CourseDetail;
