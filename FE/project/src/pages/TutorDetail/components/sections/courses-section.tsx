import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: number;
  title: string;
  description: string;
  duration: number;
  price: number;
  language: string;
  thumbnailURL: string;
  categoryName: string;
  status: string;
}

interface CoursesSectionProps {
  courses: Course[];
}

const CoursesSection = ({ courses }: CoursesSectionProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const formatPrice = (price: number) =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price || 0);

  if (!courses || courses.length === 0) {
    return (
        <motion.div
            className="bg-white rounded-xl p-8 shadow-md text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Available Courses
          </h2>
          <p className="text-gray-500">Hiện chưa có khóa học nào được đăng.</p>
        </motion.div>
    );
  }

  return (
      <motion.div
          className="bg-white rounded-xl p-8 shadow-md"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Available Courses
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
              <Card
                  key={course.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
              >
                <Link to={`/course/${course.id}`} className="flex flex-col h-full">
                  <img
                      src={
                          course.thumbnailURL ||
                          "https://placehold.co/400x250?text=No+Image"
                      }
                      alt={course.title}
                      className="w-full h-40 object-cover"
                      onError={(e) =>
                          ((e.target as HTMLImageElement).src =
                              "https://placehold.co/400x250?text=No+Image")
                      }
                  />
                  <CardContent className="p-5 flex flex-col flex-grow">
                    {/* Danh mục & trạng thái */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {course.categoryName || "General"}
                      </Badge>
                      <span
                          className={`text-xs font-medium ${
                              course.status === "Approved"
                                  ? "text-green-600"
                                  : "text-gray-500"
                          }`}
                      >
                    {course.status}
                  </span>
                    </div>

                    {/* Tiêu đề */}
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Mô tả */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                      {course.description || "No description available."}
                    </p>

                    {/* Duration & Language */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration} giờ</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span className="capitalize">{course.language}</span>
                      </div>
                    </div>

                    {/* Giá & Nút */}
                    <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold text-blue-600">
                    {formatPrice(course.price)}
                  </span>
                      <Button size="sm" className="px-4">
                        Enroll
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
          ))}
        </div>
      </motion.div>
  );
};

export default CoursesSection;
