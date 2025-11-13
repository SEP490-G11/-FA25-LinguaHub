import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Star, Heart } from "lucide-react";
import api from "@/config/axiosConfig";
import { useEffect, useState } from "react";
// import { ROUTES } from "@/constants/routes";
import { useToast } from "@/components/ui/use-toast";

interface TutorCourse {
  id: number;
}

interface CourseHeroSectionProps {
  course: {
    id: number;
    title: string;
    description: string;
    duration: number;
    price: number;
    language: string;
    thumbnailURL: string;
    tutorId: number;
    tutorName: string;
    avgRating: number;
    totalRatings: number;
    learnerCount: number;
    categoryName: string;
    createdAt: string;
    isPurchased: boolean;
  };
  wishlisted: boolean;
  setWishlisted: (value: boolean) => void;
}

const CourseHeroSection = ({ course, wishlisted, setWishlisted }: CourseHeroSectionProps) => {
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);

  const { toast } = useToast(); // ✅ toast shadcn

  /** Check khóa học có phải của tutor hay không */
  useEffect(() => {
    const checkTutorCourse = async () => {
      try {
        const res = await api.get("/tutor/courses/me");
        const myCourses = res.data.result || [];

        const found = myCourses.some((c: TutorCourse) => c.id === course.id);
        if (found) setIsOwner(true);
      } catch {
        // ignore error
      }
    };

    checkTutorCourse();
  }, [course.id]);

  /** Toggle Wishlist */
  const toggleWishlist = async () => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

    if (!token) {
      toast({
        title: "Login Required",
        description: "Please sign in to use wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${course.id}`);
        setWishlisted(false);
      } else {
        await api.post(`/wishlist/${course.id}`);
        setWishlisted(true);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update wishlist.",
        variant: "destructive",
      });
    }
  };

  /** Buy now → chuyển sang PayOS checkout page */
  const handleBuyNow = async () => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

    if (!token) {
      toast({
        title: "Login Required",
        description: "Please sign in before buying the course.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await api.post("/api/payments/create", {
        targetId: course.id,
        paymentType: "Course",
      });

      //  Redirect trực tiếp sang link thanh toán PayOS
      window.location.href = response.data.checkoutUrl;

    } catch {
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment.",
        variant: "destructive",
      });
    }
  };


  const formatPrice = (price: number) =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const formatDate = (dateString: string) =>
      new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 py-16">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* LEFT SIDE */}
            <motion.div
                className="text-white"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
            <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              {course.language}
            </span>

              <h1 className="text-4xl font-bold mt-4 mb-2">{course.title}</h1>

              <div className="flex items-center gap-4 text-blue-100 mb-4">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {course.categoryName}
              </span>
                <span className="text-sm opacity-90">Created on: {formatDate(course.createdAt)}</span>
              </div>

              <p className="text-xl text-blue-100 mb-6">{course.description}</p>

              <div className="flex items-center gap-4 text-blue-100 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span className="font-semibold">{course.avgRating.toFixed(1)}</span>
                  <span className="opacity-80 text-sm">({course.totalRatings} reviews)</span>
                </div>

                <span>•</span>
                <span>{course.learnerCount} learners</span>
              </div>

              <div className="flex items-center space-x-2 mb-6">
                <Clock className="w-5 h-5 text-blue-200" />
                <span>{course.duration} hours</span>
              </div>

              <span className="text-3xl font-bold mb-6 block">{formatPrice(course.price)}</span>

              {/* BUTTON LOGIC */}
              <div className="flex gap-4 mt-4">

                {!isOwner && !course.isPurchased && (
                    <button
                        onClick={toggleWishlist}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all border border-white ${
                            wishlisted
                                ? "bg-white text-blue-600 hover:bg-gray-100"
                                : "bg-transparent text-white hover:bg-white hover:text-blue-600"
                        }`}
                    >
                      <Heart
                          className={`w-5 h-5 ${
                              wishlisted ? "fill-blue-600 text-blue-600" : "text-white"
                          }`}
                      />
                      {wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    </button>
                )}

                {isOwner || course.isPurchased ? (
                    <button
                        onClick={() => navigate(`/learning/${course.id}`)}
                        className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                    >
                      Go to Course
                    </button>
                ) : (
                    <button
                        onClick={handleBuyNow}
                        className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
                    >
                      Buy Now
                    </button>
                )}
              </div>
            </motion.div>

            {/* RIGHT SIDE IMAGE */}
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
