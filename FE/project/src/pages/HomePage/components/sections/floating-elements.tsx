import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/config/axiosConfig";

import { Users, BookOpen, Award, Globe } from "lucide-react";

function FloatingElements() {
  const [stats, setStats] = useState({
    totalLearners: 0,
    totalTutors: 0,
    totalCourses: 0,
    totalLanguages: 12, // cố định 12 loại ngôn ngữ
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, coursesRes] = await Promise.all([
          api.get("/users"),
          api.get("/courses/public/approved"),
        ]);

        const users = usersRes.data?.result || [];
        const courses = coursesRes.data?.result || [];

        setStats((prev) => ({
          ...prev,
          totalLearners: users.filter((u: any) => u.role === "Learner").length,
          totalTutors: users.filter((u: any) => u.role === "Tutor").length,
          totalCourses: courses.length,
        }));
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M+";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K+";
    return num + "+";
  };

  const dynamicStats = [
    {
      icon: Users,
      number: formatNumber(stats.totalLearners),
      label: "Active Learners",
      description: "Learning languages on LinguaHub",
    },
    {
      icon: BookOpen,
      number: formatNumber(stats.totalTutors),
      label: "Professional Tutors",
      description: "From many countries",
    },
    {
      icon: Award,
      number: formatNumber(stats.totalCourses),
      label: "Approved Courses",
      description: "Verified for quality",
    },
    {
      icon: Globe,
      number: stats.totalLanguages + "", // không cần format
      label: "Languages",
      description: "Available to learn",
    },
  ];

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

  if (loading) return null;

  return (
      <section className="py-16 bg-gray-900">
        <div className="w-full px-8 lg:px-16">
          <motion.div
              className="text-center mb-12"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose LinguaHub?
            </h2>
            <p className="text-lg text-gray-300">
              Join thousands of successful learners worldwide
            </p>
          </motion.div>

          <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
          >
            {dynamicStats.map((stat, index) => (
                <motion.div key={index} className="text-center" variants={fadeInUp}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>

                  <div className="text-xl font-semibold text-blue-400 mb-2">
                    {stat.label}
                  </div>

                  <div className="text-gray-400">{stat.description}</div>
                </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
  );
}

export default FloatingElements;
