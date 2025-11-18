import { motion } from "framer-motion";
import { Download, FileText, FileSignature, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import api from "@/config/axiosConfig";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "react-router-dom";

interface Material {
  id: number;
  title: string;
  type: string;
  size: string;
  url: string;
}

interface Lesson {
  id: number;
  title: string;
  duration: number;
  lessonType: string;
  videoURL?: string | null;
  content?: string | null;
  transcript?: string | null;
  isDone?: boolean;
  materials: Material[];
}

interface LessonContentProps {
  lesson: Lesson;
  courseId: number;
}

const convertToEmbedUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.includes("embed")) return url;

  try {
    const u = new URL(url);
    const videoId =
        u.searchParams.get("v") || url.split("youtu.be/")[1]?.split("?")[0];
    if (!videoId) return url;

    const t = u.searchParams.get("t");
    const startParam = t ? `?start=${parseInt(t.replace(/\D/g, ""), 10)}` : "";

    return `https://www.youtube.com/embed/${videoId}${startParam}`;
  } catch {
    return url;
  }
};

const LessonContent = ({ lesson, courseId }: LessonContentProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const { toast } = useToast();
  const { courseIsDone } = useLocation().state || { courseIsDone: false };

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDone, setIsDone] = useState<boolean>(!!lesson.isDone);
  const [isAllowedToComplete, setIsAllowedToComplete] = useState<boolean>(!!lesson.isDone);

  const unlockToastRef = useRef(false);
  const watchTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  const type = lesson.lessonType?.trim().toLowerCase();

  // Helper: try fetch single-lesson progress endpoint first,
  // fallback to course endpoint if necessary.
  const fetchLessonProgress = async () => {
    // If course already marked done externally — short circuit
    if (courseIsDone) {
      unlockToastRef.current = true;
      setIsDone(true);
      setIsAllowedToComplete(true);
      return;
    }

    try {
      // 1) Try lesson progress endpoint
      const res = await api.get(`/student/lessons/${lesson.id}/progress`);
      if (res?.data?.code === 0 && res.data.result) {
        const progress = res.data.result;
        const done = progress.isDone === true;

        setIsDone(done);
        setIsAllowedToComplete(done);
        watchTimeRef.current = Number(progress.watchedDuration || 0);
        unlockToastRef.current = done;
        return;
      }
    } catch (err) {
      // ignore, we'll try fallback
      // console.warn("lesson progress fetch failed", err);
    }

    // 2) Fallback: scan course progress to find lesson status
    try {
      const resCourse = await api.get(`/student/courses/${courseId}`);
      if (resCourse?.data?.result?.sectionProgress) {
        const course = resCourse.data.result;
        for (const sec of course.sectionProgress) {
          for (const l of sec.lessons) {
            if (l.lessonId === lesson.id) {
              setIsDone(!!l.isDone);
              setIsAllowedToComplete(!!l.isDone);
              unlockToastRef.current = !!l.isDone;
              return;
            }
          }
        }
      }
    } catch (e) {
      // can't get course — treat as not done
      // console.error("fallback course check failed", e);
    }

    // If neither endpoint returned "done", ensure flags false
    setIsDone(false);
    setIsAllowedToComplete(false);
    unlockToastRef.current = false;
    watchTimeRef.current = 0;
  };

  // run once when lesson changes or courseIsDone changes
  useEffect(() => {
    fetchLessonProgress();

    // cleanup any previous interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id, courseId, courseIsDone]);

  // Auto-unlock countdown: run only when NOT done and course not done.
  useEffect(() => {
    // ensure no previous interval running
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (courseIsDone) return;
    if (isDone) return;
    if (type !== "video" && type !== "reading") return;

    // start new interval
    intervalRef.current = window.setInterval(() => {
      watchTimeRef.current += 1;

      if (watchTimeRef.current >= 10 && !isAllowedToComplete) {
        setIsAllowedToComplete(true);
        if (!unlockToastRef.current) {
          unlockToastRef.current = true;
          toast({
            title: "Lesson unlocked! 🎉",
            description: "You can now mark this lesson as completed.",
            className: "bg-green-600 text-white border-none",
          });
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [type, isDone, isAllowedToComplete, courseIsDone, toast]);

  // Force-refresh lesson status from course (helper after marking done)
  const refreshLessonStatusFromCourse = async () => {
    try {
      const res = await api.get(`/student/courses/${courseId}`);
      const course = res.data.result;
      if (!course?.sectionProgress) return;

      for (const section of course.sectionProgress) {
        for (const l of section.lessons) {
          if (l.lessonId === lesson.id) {
            setIsDone(!!l.isDone);
            setIsAllowedToComplete(!!l.isDone);
            unlockToastRef.current = !!l.isDone;
            return;
          }
        }
      }
    } catch (e) {
      // ignore
    }
  };

  // Mark completed API
  const markLessonCompleted = async () => {
    // guard: if course already done, don't allow
    if (courseIsDone) return;

    try {
      setIsUpdating(true);

      const payload = {
        isDone: true,
        watchedDuration: Number(watchTimeRef.current || 0),
      };

      const res = await api.post(`/student/lessons/${lesson.id}/progress`, payload);

      if (res?.data?.code === 0) {
        toast({
          title: "Completed ✔",
          description: "Your progress has been saved.",
          className: "bg-green-600 text-white border-none",
        });

        // refresh local flags from server (best-effort)
        await fetchLessonProgress();
        await refreshLessonStatusFromCourse();
      } else {
        toast({
          variant: "destructive",
          title: "Failed",
          description: "Could not save progress.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot connect to server.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const renderLessonPlayer = () => {
    switch (type) {
      case "video":
        return (
            <iframe
                src={convertToEmbedUrl(lesson.videoURL) || ""}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        );

      case "reading":
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-10 py-12 bg-gradient-to-br from-blue-50 to-purple-50 text-center">
              <div className="bg-white p-5 rounded-2xl shadow-lg mb-4">
                <BookOpen className="w-12 h-12 text-blue-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800">Reading Lesson</h2>

              <p className="text-gray-600 mt-2">Estimated reading time: {lesson.duration} minutes</p>

              <p className="text-gray-500 max-w-2xl mt-6">When you're done reading, click the button below.</p>
            </div>
        );

      default:
        return (
            <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
              Unsupported lesson type: {lesson.lessonType}
            </div>
        );
    }
  };

  return (
      <div className="lg:col-span-2">
        {/* VIDEO PLAYER */}
        <Card className="mb-4 overflow-hidden shadow-xl border-0">
          <motion.div initial="initial" animate="animate" variants={fadeInUp}>
            <div className="aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-black relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent" />
              {renderLessonPlayer()}
            </div>
          </motion.div>
        </Card>

        {/* BUTTON MARK DONE */}
        <div className="flex justify-end mb-8">
          <Button
              disabled={isDone || !isAllowedToComplete || isUpdating || courseIsDone}
              onClick={markLessonCompleted}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white shadow-md disabled:opacity-40 rounded-full"
          >
            {isDone || courseIsDone
                ? "Completed"
                : !isAllowedToComplete
                    ? "Watch to unlock"
                    : isUpdating
                        ? "Saving..."
                        : "Mark as Completed"}
          </Button>
        </div>

        {/* CONTENT */}
        <Card className="shadow-xl border-0">
          <motion.div initial="initial" animate="animate" variants={fadeInUp} transition={{ delay: 0.1 }}>
            <Tabs defaultValue="materials" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-50 to-purple-50 p-1">
                <TabsTrigger
                    value="materials"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Materials
                </TabsTrigger>

                <TabsTrigger
                    value="transcript"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  <FileSignature className="w-4 h-4 mr-2" />
                  {type === "reading" ? "Reading Content" : "Transcript"}
                </TabsTrigger>
              </TabsList>

              {/* MATERIALS */}
              <TabsContent value="materials" className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <span>Lesson Materials</span>
                </h3>

                {lesson.materials?.length ? (
                    <div className="grid grid-cols-1 gap-4">
                      {lesson.materials.map((material, index) => (
                          <motion.div key={material.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                            <Card className="p-5 hover:shadow-lg transition-all hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                                    <FileText className="w-6 h-6 text-white" />
                                  </div>

                                  <div>
                                    <h4 className="font-bold text-gray-900">{material.title}</h4>
                                    <div className="text-sm text-gray-600 flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {material.type}
                                      </Badge>
                                      <span>•</span>
                                      <span>{material.size}</span>
                                    </div>
                                  </div>
                                </div>

                                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                                  <a href={material.url} download target="_blank" rel="noreferrer">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </a>
                                </Button>
                              </div>
                            </Card>
                          </motion.div>
                      ))}
                    </div>
                ) : (
                    <p>No materials available.</p>
                )}
              </TabsContent>

              {/* TRANSCRIPT */}
              <TabsContent value="transcript" className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <FileSignature className="w-6 h-6 text-purple-600" />
                  <span>{type === "reading" ? "Reading Content" : "Transcript"}</span>
                </h3>

                <Card className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 border-0 shadow-lg">
                  <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans">{lesson.content || lesson.transcript || "No content available."}</pre>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </Card>
      </div>
  );
};

export default LessonContent;
