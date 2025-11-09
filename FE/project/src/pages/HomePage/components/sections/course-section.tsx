import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/config/axiosConfig.ts";
import { ROUTES } from "@/constants/routes.ts";

// ✅ Course interface lấy từ API JSON
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

  // ✅ Fetch API trực tiếp không cần redux
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get<{ code: number; result: Course[] }>(
            "/courses/public/approved"
        );

        setCourses(res.data.result || []);
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

  // ✅ Random lại danh sách để Recommend
  const getRandomCourses = (list: Course[], count: number) =>
      [...list].sort(() => 0.5 - Math.random()).slice(0, count);

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
          {!loading && (
              <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  variants={staggerContainer}
              >
                {courses.slice(0, 6).map((course) => (
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
                            <p className="text-muted-foreground mb-2">
                              By {course.tutorName}
                            </p>

                            {/* ✅ New info row */}
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>{course.duration} hours</span>
                              </div>

                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{course.learnerCount}</span>
                              </div>

                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span>{course.avgRating.toFixed(1)}</span>
                              </div>
                            </div>

                            {/* BOTTOM AREA */}
                            <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          {course.price.toLocaleString()}₫
                        </span>
                              <Button>Join</Button>
                            </div>

                            {/* Created date */}
                            <p className="text-xs text-muted-foreground text-right mt-2">
                              Created: {formatDate(course.createdAt)}
                            </p>
                          </CardContent>
                        </Link>
                      </Card>
                    </motion.div>
                ))}
              </motion.div>
          )}

          {/* YOU MIGHT ALSO LIKE */}
          {!loading && courses.length > 0 && (
              <div className="border-t pt-12">
                <h3 className="text-2xl font-bold mb-6 text-center">You Might Also Like</h3>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                >
                  {getRandomCourses(courses, 4).map((course) => (
                      <motion.div key={`alt-${course.id}`} variants={fadeInUp}>
                        <Card className="overflow-hidden hover:shadow-lg transition">
                          <Link to={`/course/${course.id}`}>
                            <img
                                src={course.thumbnailURL}
                                alt={course.title}
                                className="w-full h-32 object-cover"
                            />
                            <CardContent>
                              <h4 className="font-semibold text-sm mt-2">{course.title}</h4>
                              <p className="text-xs text-muted-foreground">By {course.tutorName}</p>
                              <span className="text-sm font-bold text-primary">
                          {course.price.toLocaleString()}₫
                        </span>
                            </CardContent>
                          </Link>
                        </Card>
                      </motion.div>
                  ))}
                </motion.div>

                <div className="text-center mt-8">
                  <Button size="lg" asChild>
                    <Link to={ROUTES.LANGUAGES}>View All Courses</Link>
                  </Button>
                </div>
              </div>
          )}
        </div>
      </section>
  );
};

export default CourseSection;
