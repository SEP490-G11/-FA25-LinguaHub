import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

interface LessonSidebarProps {
  lesson: any;
  course?: any; // optional nếu cần progress
}

const LessonSidebar = ({ lesson, course }: LessonSidebarProps) => {
  const navigate = useNavigate();
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  // Tính progress (nếu có course)
  let progress = 0;
  let totalLessons = 0;

  if (course?.section) {
    totalLessons = course.section.reduce(
        (sum: number, sec: any) => sum + sec.lessons.length,
        0
    );

    const completed = 0; // TODO: gọi API progress nếu BE có
    progress = Math.round((completed / totalLessons) * 100);
  }

  return (
      <div className="lg:col-span-1">
        {/* PROGRESS */}
        {course && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={fadeInUp}
                    transition={{ delay: 0.2 }}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tiến độ khóa học</span>
                      <span className="font-medium">{progress}%</span>
                    </div>

                    <Progress value={progress} className="w-full" />

                    <div className="text-sm text-muted-foreground">
                      {0} / {totalLessons} bài học hoàn thành
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
        )}

        {/* NEXT LESSON */}
        {lesson.nextLesson && (
            <Card>
              <CardHeader>
                <CardTitle>Bài học tiếp theo</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={fadeInUp}
                    transition={{ delay: 0.3 }}
                >
                  <Card className="p-4">
                    <h4 className="font-medium text-foreground mb-2">
                      {lesson.nextLesson.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Bài số {lesson.nextLesson.week}
                    </p>

                    <Button
                        className="w-full"
                        onClick={() => navigate(`/lesson/${lesson.nextLesson.id}`, { state: { course } })}
                    >
                      Tiếp tục học
                    </Button>
                  </Card>
                </motion.div>
              </CardContent>
            </Card>
        )}
      </div>
  );
};

export default LessonSidebar;
