import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface CourseHeroSectionProps {
  course: any;
}

const CourseHeroSection = ({ course }: CourseHeroSectionProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 py-16">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* LEFT SIDE */}
            <motion.div
                className="text-white"
                initial="initial"
                animate="animate"
                variants={fadeInUp}
            >

              {/*  Chỉ hiển thị language từ API */}
              <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              {course.language}
            </span>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-blue-100 mb-6">{course.description}</p>

              {/*  Chỉ hiển thị duration có từ API */}
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-200" />
                <span>{course.duration} hours</span>
              </div>

              {/*  PRICE */}
              <div className="mt-6 flex items-center space-x-3">
                <span className="text-3xl font-bold">{formatPrice(course.price)}</span>
              </div>
            </motion.div>

            {/* RIGHT SIDE — THUMBNAIL */}
            <motion.div
                className="relative"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
              <img
                  src={course.thumbnailURL}
                  alt={course.title}
                  className="rounded-2xl shadow-2xl"
              />
            </motion.div>

          </div>
        </div>
      </section>
  );
};

export default CourseHeroSection;
