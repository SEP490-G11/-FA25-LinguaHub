import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {  MapPin, Award, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from "@/config/axiosConfig.ts";
import { ROUTES } from '@/constants/routes.ts';

// Interface giống với dữ liệu server trả về
interface Tutor {
  tutorId: number;
  userId: number;
  userEmail: string;
  userName: string;
  avatarURL: string | null;
  country: string | null;
  specialization: string | null;
  teachingLanguage: string | null;
  pricePerHour: number | null;
  status: string;
}

const TopTutors = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  // === call API trực tiếp ===
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await api.get<Tutor[]>("/tutors/approved");
        setTutors(res.data);
      } catch (error) {
        console.error("Failed to fetch tutors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

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

  const formatPrice = (price: number | null) => {
    if (!price) return "—";
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  };

  return (
      <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="w-full px-8 lg:px-16">

          <motion.div className="text-center mb-12" initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp}>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Award className="w-4 h-4" />
              <span>Top Tutors</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">Meet the Top Teachers</h2>
          </motion.div>

          {/* Nếu đang loading */}
          {loading && <p className="text-center text-muted-foreground">Loading...</p>}

          <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
          >
            {tutors.slice(0, 4).map((tutor) => (
                <motion.div key={tutor.tutorId} variants={fadeInUp}>
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
                    <Link to={`/tutors-Detail/${tutor.tutorId}`}>
                      <div className="relative w-full h-85 overflow-hidden rounded-t-xl bg-gray-100">
                        <img
                            src={tutor.avatarURL || "https://via.placeholder.com/300x200"}
                            alt={tutor.userName}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-indigo-600 transition-colors">
                            {tutor.userName}
                          </h3>
                          {/*<div className="flex items-center space-x-1">*/}
                          {/*  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />*/}
                          {/*  <span className="text-sm font-medium">5.0</span>*/}
                          {/*</div>*/}
                        </div>

                        <div className="flex items-center space-x-2 mb-3">
                          <MapPin className="w-4 h-4 text-muted-foreground"/>
                          <span className="text-sm text-muted-foreground">
                        {tutor.country || "Unknown"}
                      </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {tutor.specialization || "No description"}
                        </p>
                        <div className="flex justify-end">
                          <span className="text-lg font-bold text-indigo-600">
                          {formatPrice(tutor.pricePerHour)}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">/slot</span>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
            ))}
          </motion.div>

          <motion.div className="text-center" initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp}>
            <Button size="lg" asChild
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
              <Link to={ROUTES.TUTORS}>
                View all teachers
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
  );
};

export default TopTutors;
