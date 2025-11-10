import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Clock, BookOpen,  Globe, Heart } from "lucide-react";
import api from "@/config/axiosConfig";
import { ROUTES } from "@/constants/routes"; // ✅ thêm dòng này

interface CourseSidebarProps {
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
    tutorAvatarURL: string | null;
    learnerCount: number;
    avgRating: number;
    totalRatings: number;
    tutorAddress: string;
    section: {
      sectionID: number;
      orderIndex: number;
      title: string;
      lessons: {
        lessonID: number;
        title: string;
        duration: number;
      }[];
    }[];
  };

  wishlisted: boolean;
  setWishlisted: (value: boolean) => void;
}

const CourseSidebar = ({ course, wishlisted, setWishlisted }: CourseSidebarProps) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);

  /** Toggle wishlist với check đăng nhập */
  const toggleWishlist = async () => {
    try {
      const token =
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token");

      if (!token) {
        alert("Please login to use favorite feature.");
        return;
      }

      if (wishlisted) {
        await api.delete(`/wishlist/${course.id}`);
        setWishlisted(false);
      } else {
        await api.post(`/wishlist/${course.id}`);
        setWishlisted(true);
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error?.response?.status === 401) {
        alert("Please login to use favorite feature.");
        return;
      }
      console.error("Wishlist update error:", err);
    }
  };

  /**  Mua khóa học */
  const handleBuyNow = () => {
    const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

    if (!token) {
      alert("Please login to purchase the course.");
      return;
    }

    navigate(`/payment/${course.id}`);
  };
  const handleViewProfile = () => {
    const tutorId = course.tutorName?.toLowerCase().replace(/\s+/g, "-");
    navigate(ROUTES.TUTOR_DETAIL.replace(":id", tutorId));
  };

  const totalLessons = course.section?.reduce(
      (total, sec) => total + sec.lessons.length,
      0
  );

  return (
      <div className="lg:col-span-1">
        {/* Instructor */}
        <motion.div
            className="bg-white rounded-xl p-6 shadow-md mb-8"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Instructor</h3>

          <div className="flex items-center space-x-4 mb-4">
            <img
                src={
                    course.tutorAvatarURL ||
                    "https://placehold.co/150x150/png?text=Tutor"
                }
                alt={course.tutorName}
                className="w-16 h-16 rounded-full object-cover"
            />

            <div>
              <h4 className="font-semibold text-gray-900">{course.tutorName}</h4>

              {/* Địa chỉ tutor */}
              {course.tutorAddress && (
                  <p className="text-sm text-gray-500 mt-0.5">{course.tutorAddress}</p>
              )}

              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400"/>
                <span className="text-sm">{course.avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">
                 ({course.totalRatings} reviews)
                </span>
              </div>
            </div>

          </div>

          {/*  Nút xem hồ sơ */}
          <button
              onClick={handleViewProfile}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            View Profile
          </button>
        </motion.div>

        {/* Course Info */}
        <motion.div
            className="bg-white rounded-xl p-6 shadow-md mb-8"
            initial={{opacity: 0, y: 60}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true }}
            transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Course Information
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Duration</span>
              </div>
              <span className="font-medium">{course.duration} hours</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Lessons</span>
              </div>
              <span className="font-medium">{totalLessons}</span>
            </div>

            {/*<div className="flex items-center justify-between">*/}
            {/*  <div className="flex items-center space-x-2">*/}
            {/*    <Calendar className="w-5 h-5 text-gray-500" />*/}
            {/*    <span className="text-gray-600">Schedule</span>*/}
            {/*  </div>*/}
            {/*  <span className="font-medium">Flexible</span>*/}
            {/*</div>*/}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Language</span>
              </div>
              <span className="font-medium">{course.language}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment & Wishlist */}
        <motion.div
            className="bg-white rounded-xl p-6 shadow-md"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-4">
          <span className="text-3xl font-bold text-blue-600">
            {formatPrice(course.price)}
          </span>
          </div>

          <button
              onClick={handleBuyNow}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-3"
          >
            Buy Now
          </button>

          <button
              onClick={toggleWishlist}
              className="w-full flex justify-center items-center gap-2 border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            <Heart
                className={`w-5 h-5 ${
                    wishlisted ? "fill-blue-600 text-blue-600" : ""
                }`}
            />
            {wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          </button>
        </motion.div>
      </div>
  );
};

export default CourseSidebar;
