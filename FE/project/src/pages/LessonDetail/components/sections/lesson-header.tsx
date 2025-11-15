import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LessonHeaderProps {
  lesson: any;
  courseId: number | string;
  courseTitle: string; // ➕ thêm field mới
}

const LessonHeader = ({ lesson, courseId, courseTitle }: LessonHeaderProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  // Format duration: 15 → "15 min"
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
      <section className="bg-card border-b py-6">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <motion.div initial="initial" animate="animate" variants={fadeInUp}>
            {/* Top Navigation */}
            <div className="flex items-center space-x-4 mb-4">
              <Button variant="ghost" asChild>
                <Link to={`/course/${courseId}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Course
                </Link>
              </Button>

              <div className="text-muted-foreground">|</div>

              {/* Course Title */}
              <span className="text-muted-foreground truncate max-w-[200px] md:max-w-xs">
              {courseTitle}
            </span>

              <div className="text-muted-foreground">|</div>

              {/* Lesson Number */}
              <span className="text-muted-foreground">Lesson {lesson.week}</span>
            </div>

            {/* Lesson Title */}
            <h1 className="text-3xl font-bold text-foreground">{lesson.title}</h1>

            {/* Meta info */}
            <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(parseInt(lesson.duration))}</span>
              </div>

              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>Lesson {lesson.week}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
  );
};

export default LessonHeader;
