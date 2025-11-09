import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {Clock, Users, Star, ChevronRight} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/config/axiosConfig.ts";
import { ROUTES } from "@/constants/routes.ts";


interface Course {
  id: number;
  title: string;
  description: string;
  duration: number;
  price: number;
  language: string;
  thumbnailURL: string;
  categoryName: string;
  tutorName: string;
  learnerCount: number;
  avgRating: number;
  createdAt: string;
}

const CourseSection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get<{ code: number; result: Course[] }>(
            "/courses/public/approved"
        );

        // ✅ Lấy 6 khóa có rating cao nhất (desc)
        const sorted = res.data.result
            .sort((a, b) => b.avgRating - a.avgRating)
            .slice(0, 6);

        setCourses(sorted);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const formatDate = (date: string) =>
      new Date(date).toLocaleDateString("vi-VN");

  return (
      <section className="py-16 bg-muted/50">
        <div className="w-full px-8 lg:px-16">
          {/* TITLE */}
          <motion.div
              className="text-center mb-12"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Popular Language Lessons
            </h2>
            <p className="text-lg text-muted-foreground">
              Learn from our most experienced and highly-rated instructors
            </p>
          </motion.div>

          {/* LOADING */}
          {loading && <p className="text-center text-lg py-8">Loading courses...</p>}

          {/* COURSES LIST */}
          {!loading && courses.length > 0 && (
              <>
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                >
                  {courses.map((course) => (
                      <motion.div key={course.id} variants={fadeInUp}>
                        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
                          <Link to={`/course/${course.id}`}>
                            <div className="relative overflow-hidden">
                              <img
                                  src={course.thumbnailURL}
                                  alt={course.title}
                                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-primary text-primary-foreground">
                                  {course.categoryName}
                                </Badge>
                              </div>
                            </div>

                            <CardContent className="p-6">
                              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                                {course.title}
                              </h3>

                              {/* ⭐ Rating cùng dòng với tutor */}
                              <div className="flex items-center justify-between text-muted-foreground mb-1">
                                <p>By {course.tutorName}</p>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-medium">{course.avgRating.toFixed(1)}</span>
                                </div>
                              </div>

                              {/* 👥 Learner count ngay dưới rating */}
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                                <Users className="w-4 h-4" />
                                <span>{course.learnerCount} learners</span>
                              </div>

                              {/* Duration */}
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                                <Clock className="w-4 h-4" />
                                <span>{course.duration} hours</span>
                              </div>

                              {/* ✅ Giá + ngày tạo + Join giữ nguyên UI */}
                              <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                            <span className="text-xl font-bold text-primary">
                              {course.price.toLocaleString()}₫
                            </span>
                                  <span className="text-xs text-muted-foreground">
                              Created: {formatDate(course.createdAt)}
                            </span>
                                </div>
                                <Button>Join</Button>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      </motion.div>
                  ))}
                </motion.div>

                {/* ✅ BUTTON: View All Courses (đúng vị trí & animation) */}
                <motion.div
                    className="text-center mt-8"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                  <Button size="lg" asChild>
                    <Link to={ROUTES.LANGUAGES}>View All Courses  <ChevronRight className="w-4 h-4 ml-2" /></Link>
                  </Button>
                </motion.div>
              </>
          )}
        </div>
      </section>
  );
};

export default CourseSection;
