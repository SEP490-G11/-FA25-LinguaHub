import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types/Course";

interface CoursesGridProps {
    courses: Course[];
    loading?: boolean;
}

const CoursesGrid = ({ courses, loading }: CoursesGridProps) => {
    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
    };
    const staggerContainer = {
        animate: {
            transition: { staggerChildren: 0.1 },
        },
    };

    if (loading) {
        return <p className="text-center py-10 text-lg font-medium">Loading courses...</p>;
    }

    if (courses.length === 0) {
        return (
            <section className="py-16 text-center">
                <h2 className="text-xl font-semibold">No courses found</h2>
                <p className="text-muted-foreground mt-2">Try adjusting search or filters.</p>
            </section>
        );
    }

    const formatDate = (date: string) => new Date(date).toLocaleDateString("vi-VN");

    return (
        <section className="py-16">
            <motion.div
                className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-8 lg:px-16"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                {courses.map((course) => (
                    <motion.div key={course.id} variants={fadeInUp}>
                        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full">
                            <Link to={`/course/${course.id}`} className="flex flex-col h-full">
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

                                <CardContent className="p-6 flex flex-col flex-grow">
                                    {/* 🔹 Title & Tutor */}
                                    <div className="min-h-[70px] flex flex-col justify-between mb-3">
                                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2">
                                            {course.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm">By {course.tutorName}</p>
                                    </div>

                                    {/* Rating + Learners */}
                                    <div
                                        className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4"/>
                                            <span>{course.learnerCount} learners</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/>
                                            <span className="font-medium">{course.avgRating?.toFixed(1) || "0.0"}</span>
                                        </div>
                                    </div>


                                    {/* 🔹 Duration */}
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                                        <Clock className="w-4 h-4"/>
                                        <span>{course.duration} hours</span>
                                    </div>

                                    {/* 🔹 Price + Created date + Join */}
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t">
                                        <div className="flex flex-col">
                                            <span className="text-xl font-bold text-primary">
                                                {course.price.toLocaleString()}₫
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                  Created: {formatDate(course.createdAt)}
                                             </span>
                                        </div>

                                        <Button
                                            asChild
                                            className="flex-shrink-0 whitespace-nowrap min-w-[90px]"
                                        >
                                            <Link to={`/course/${course.id}`}>Join</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

export default CoursesGrid;
