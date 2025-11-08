import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { CourseDetail } from "@/types/Course.ts";

interface CourseContentProps {
    course: CourseDetail;
}

const CourseContent = ({ course }: CourseContentProps) => {
    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
    };

    return (
        <div className="lg:col-span-2">

            {/* ✅ COURSE CURRICULUM FROM API */}
            {course.section && (
                <motion.div
                    className="bg-white rounded-xl p-8 shadow-md mb-8"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Curriculum</h2>

                    <div className="space-y-4">
                        {course.section.map((section) => (
                            <div key={section.sectionID} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900">
                                        {section.orderIndex}. {section.title}
                                    </h3>
                                    <span className="text-sm text-gray-500">
                    {section.lessons.length} lessons
                  </span>
                                </div>

                                <ul className="space-y-2">
                                    {section.lessons.map((lesson) => (
                                        <li
                                            key={lesson.lessonID}
                                            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                                        >
                                            <Link
                                                to={`/lesson/${lesson.lessonID}`}
                                                className="flex items-center space-x-2 w-full"
                                            >
                                                <BookOpen className="w-4 h-4 text-blue-500" />
                                                <span>{lesson.title}</span>

                                                <span className="text-xs text-gray-400 ml-auto">
                          {lesson.duration} min
                        </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default CourseContent;
