import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LessonSidebarProps {
  lesson: {
    id: number;
    week: number;
  };
  course?: {
    id: number;
    section: {
      sectionID: number;
      title: string;
      lessons: {
        lessonID: number;
        title: string;
        duration?: number;
        isDone?: boolean;
      }[];
    }[];
  } | null;
}

const LessonSidebar = ({ course }: LessonSidebarProps) => {
  const navigate = useNavigate();

  const [openSections, setOpenSections] = useState<{ [key: number]: boolean }>( {});
  const toggleSection = (id: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // =============== TÍNH TIẾN ĐỘ ===============
  let totalLessons = 0;
  let completed = 0;

  if (course?.section) {
    course.section.forEach((sec) => {
      totalLessons += sec.lessons.length;
      completed += sec.lessons.filter((l) => l.isDone).length;
    });
  }

  const progress = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;

  const formatDuration = (min?: number) => {
    if (!min) return "";
    return `${min} min`;
  };

  return (
      <div className="lg:col-span-1">

        {/* ================= PROGRESS CARD ================= */}
        <Card className="mb-6 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-8">
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Course Progress</span>
                  <span className="font-bold text-2xl text-blue-600">{progress}%</span>
                </div>

                <Progress value={progress} className="w-full h-3" />

                <span className="text-gray-600 text-sm">
                {completed} / {totalLessons} lessons
              </span>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* ================= COURSE CONTENT ================= */}
        <Card className="overflow-hidden border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Course Content</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {course?.section?.map((sec, index) => {
                const isOpen = openSections[sec.sectionID];

                return (
                    <div key={sec.sectionID} className="border-b pb-4">

                      <button
                          onClick={() => toggleSection(sec.sectionID)}
                          className="w-full flex justify-between items-center py-2"
                      >
                        {/* LEFT SIDE */}
                        <div className="flex flex-col items-start leading-normal">
                          <h3 className="text-base font-bold text-gray-800">
                            {index + 1}. {sec.title}
                          </h3>

                          <p className="text-sm text-gray-500 mt-0.5">
                            {sec.lessons.length} lessons
                          </p>
                        </div>

                        <ChevronDown
                            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {/* LESSON LIST */}
                      {isOpen && (
                          <div className="space-y-2 mt-3 pl-8 pr-2">
                            {sec.lessons.map((ls) => (
                                <button
                                    key={ls.lessonID}
                                    onClick={() =>
                                        navigate(`/lesson/${ls.lessonID}`, {
                                          state: { courseId: course.id },
                                        })
                                    }
                                    className="w-full flex justify-between items-center py-2 px-2 rounded-lg hover:bg-gray-100 transition text-left"
                                >
                                  <div className="flex items-start gap-3">
                                    {ls.isDone ? (
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                                    ) : (
                                        <BookOpen className="w-4 h-4 text-blue-600 mt-1" />
                                    )}

                                    <span
                                        className={`text-sm ${
                                            ls.isDone ? "text-green-700 font-medium" : "text-gray-800"
                                        }`}
                                    >
                              {ls.title}
                            </span>
                                  </div>

                                  {ls.duration && (
                                      <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDuration(ls.duration)}
                            </span>
                                  )}
                                </button>
                            ))}
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default LessonSidebar;
