import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Clock, BookOpen, Calendar, Globe } from "lucide-react";
import { CourseDetail } from "@/types/Course.ts";

interface CourseSidebarProps {
  course: CourseDetail & {
    instructor?: {
      name: string;
      image: string;
      flag: string;
      country: string;
    };
  };
}

const CourseSidebar = ({ course }: CourseSidebarProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  /** ✅ Tính tổng số lesson thật từ BE */
  const totalLessons = course.section?.reduce(
      (total, sec) => total + sec.lessons.length,
      0
  );

  return (
      <div className="lg:col-span-1">

        {/* ✅ Instructor Info Card */}
        {course.instructor && (
            <motion.div
                className="bg-white rounded-xl p-6 shadow-md mb-8"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Instructor</h3>

              <div className="flex items-center space-x-4 mb-4">
                <img
                    src={course.instructor.image}
                    alt={course.instructor.name}
                    className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{course.instructor.name}</h4>
                  <p className="text-sm text-gray-600">
                    {course.instructor.flag} {course.instructor.country}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">4.8</span>
                    <span className="text-sm text-gray-500">(2000 students)</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                View Profile
              </button>
            </motion.div>
        )}

        {/* ✅ Course information */}
        <motion.div
            className="bg-white rounded-xl p-6 shadow-md mb-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Course Information</h3>

          <div className="space-y-4">

            {/* Duration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Duration</span>
              </div>
              <span className="font-medium">{course.duration} hours</span>
            </div>

            {/* Total lessons from BE */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Lessons</span>
              </div>
              <span className="font-medium">{totalLessons}</span>
            </div>

            {/* Schedule placeholder */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Schedule</span>
              </div>
              <span className="font-medium">Flexible</span>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Language</span>
              </div>
              <span className="font-medium">{course.language}</span>
            </div>
          </div>
        </motion.div>

        {/* ✅ Payment CTA */}
        <motion.div
            className="bg-white rounded-xl p-6 shadow-md"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
        >
          <div className="text-center mb-4">
          <span className="text-3xl font-bold text-blue-600">
            {formatPrice(course.price)}
          </span>
          </div>

          <Link
              to={`/payment/${course.id}`}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors mb-3 block text-center"
          >
            Thanh toán ngay
          </Link>

          <button className="w-full border border-blue-500 text-blue-500 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Thêm vào yêu thích
          </button>
        </motion.div>
      </div>
  );
};

export default CourseSidebar;
