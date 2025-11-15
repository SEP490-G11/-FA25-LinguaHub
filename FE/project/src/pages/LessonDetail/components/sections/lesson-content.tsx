import React from 'react';
import { motion } from 'framer-motion';
import { Play, Download, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface LessonContentProps {
  lesson: any;
}

const LessonContent = ({ lesson }: LessonContentProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const formatDuration = (min: number) => {
    if (!min) return "0 min";
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
  };

  return (
      <div className="lg:col-span-2">
        {/* 🎬 VIDEO PLAYER */}
        <Card className="mb-8">
          <motion.div initial="initial" animate="animate" variants={fadeInUp}>
            <div className="aspect-video bg-black relative rounded-md overflow-hidden">

              {lesson.videoURL ? (
                  <video
                      src={lesson.videoURL}
                      controls
                      className="w-full h-full"
                  />
              ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <Button size="icon" className="h-16 w-16 rounded-full">
                      <Play className="w-8 h-8 ml-1" />
                    </Button>
                  </div>
              )}

              <Badge className="absolute bottom-4 left-4 bg-black/50 text-white">
                {formatDuration(lesson.duration)}
              </Badge>
            </div>
          </motion.div>
        </Card>

        {/* 📑 TABS */}
        <Card>
          <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="transcript" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              </TabsList>

              {/* 📘 MATERIALS */}
              <TabsContent value="materials" className="p-6">
                <h3 className="text-xl font-bold mb-4">Tài liệu bài học</h3>

                {lesson.resources?.length ? (
                    <div className="space-y-4">
                      {lesson.resources.map((res: any) => (
                          <Card key={res.resourceID} className="p-4 hover:bg-muted/50 transition">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                  <FileText className="w-5 h-5 text-primary" />
                                </div>

                                <div>
                                  <h4 className="font-medium">{res.resourceTitle}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {res.resourceType}
                                  </p>
                                </div>
                              </div>

                              <Button size="sm" asChild>
                                <a href={res.resourceURL} download target="_blank">
                                  <Download className="w-4 h-4 mr-2" /> Tải về
                                </a>
                              </Button>
                            </div>
                          </Card>
                      ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">Không có tài liệu đính kèm.</p>
                )}
              </TabsContent>

              {/* 📝 TRANSCRIPT */}
              <TabsContent value="transcript" className="p-6">
                <h3 className="text-xl font-bold mb-4">Nội dung bài học</h3>

                <Card className="bg-muted/50 p-6">
                <pre className="whitespace-pre-wrap leading-relaxed">
                  {lesson.content || "Không có nội dung transcript."}
                </pre>
                </Card>
              </TabsContent>

            </Tabs>
          </motion.div>
        </Card>
      </div>
  );
};

export default LessonContent;
