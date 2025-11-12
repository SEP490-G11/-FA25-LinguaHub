import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface CourseContentProps {
    course: {
        id: number;
        title: string;
        description: string;
        duration: number;
        price: number;
        language: string;
        thumbnailURL: string;
        categoryName: string;
        tutorName: string;

        section: {
            sectionID: number;
            title: string;
            orderIndex: number;
            lessons: {
                lessonID: number;
                title: string;
                duration: number;
                lessonType: string;
                videoURL: string | null;
                content: string;
                orderIndex: number;
            }[];
        }[];
    };
    isPurchased: boolean | null;
}

const CourseContent = ({ course, isPurchased }: CourseContentProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
    };

    const handleLessonClick = (lessonId: number) => {
        const token =
            localStorage.getItem("access_token") ||
            sessionStorage.getItem("access_token");

        if (!token) {
            toast({
                variant: "destructive",
                title: "Login required",
                description: "Please log in to access lessons.",
            });
            return;
        }

        if (!isPurchased) {
            toast({
                variant: "destructive",
                title: "Purchase required",
                description: "You must purchase the course before accessing lessons.",
            });
            return;
        }

        navigate(`/lesson/${lessonId}`);
    };

    return (
        <div className="lg:col-span-2">
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
                                            onClick={() => handleLessonClick(lesson.lessonID)}
                                        >
                                            <BookOpen className="w-4 h-4 text-blue-500" />
                                            <span>{lesson.title}</span>
                                            <span className="text-xs text-gray-400 ml-auto">
                                                {lesson.duration} min
                                            </span>
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
