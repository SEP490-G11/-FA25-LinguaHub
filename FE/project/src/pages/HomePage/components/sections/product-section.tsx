import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// ✅ Redux
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchApprovedCourses } from "@/redux/slices/homeSlide";
import { RootState,AppDispatch } from "@/redux/store";


const ProductSection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { courses, loading } = useSelector((state: RootState) => state.home);

  // ✅ Call API on first load
  useEffect(() => {
    dispatch(fetchApprovedCourses());
  }, [dispatch]);

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
          {loading && (
              <p className="text-center text-lg py-8">Loading courses...</p>
          )}

          {/* ✅ COURSES LIST */}
          {!loading && (
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
                            <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              By {course.tutorName}
                            </p>

                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{course.duration} hours</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          {course.price.toLocaleString()}đ
                        </span>
                              <Button>Book Lesson</Button>
                            </div>
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
                <motion.h3
                    className="text-2xl font-bold text-foreground mb-8 text-center"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                  You Might Also Like
                </motion.h3>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                >
                  {courses.slice(0, 4).map((course) => (
                      <motion.div key={`also-${course.id}`} variants={fadeInUp}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                          <Link to={`/course/${course.id}`}>
                            <img
                                src={course.thumbnailURL}
                                alt={course.title}
                                className="w-full h-32 object-cover"
                            />
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">
                                {course.title}
                              </h4>
                              <span className="text-sm font-bold text-primary">
                          {course.price.toLocaleString()}đ
                        </span>
                            </CardContent>
                          </Link>
                        </Card>
                      </motion.div>
                  ))}
                </motion.div>

                <motion.div
                    className="text-center mt-8"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                  <Button size="lg" asChild>
                    <Link to="/tutors">View All Courses</Link>
                  </Button>
                </motion.div>
              </div>
          )}
        </div>
      </section>
  );
};

export default ProductSection;
