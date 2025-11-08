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

  /** ❗ Không mock dữ liệu nữa, dùng trực tiếp từ API */
  const formatCourseData = {
    ...course,

    // Giữ các key cần cho UI
    instructor: {
      name: course.tutorName,
      image: course.thumbnailURL ?? "",
      flag: "🌍",
      country: course.language,
    },

    // truyền section từ API vào content (CourseContent và Sidebar dùng)
    curriculum: course.section ?? [],
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <CourseHeroSection course={formatCourseData} />

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <CourseContent course={formatCourseData} />
              <CourseSidebar course={formatCourseData} />
            </div>
          </div>
        </section>
      </div>
  );
};

export default CourseDetail;
