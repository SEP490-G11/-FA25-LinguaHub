import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Clock, BookOpen, Globe, Heart } from "lucide-react";
import api from "@/config/axiosConfig";
import { ROUTES } from "@/constants/routes";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getUserId } from "@/lib/getUserId.ts";

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
    tutorID: number;
    isPurchased: boolean;
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
    contentSummary: {
      totalVideoHours: number;
      totalPracticeTests: number;
      totalArticles: number;
      totalDownloadableResources: number;
    };
    objectives: string[];
  };

  wishlisted: boolean;
  setWishlisted: (value: boolean) => void;
}

interface TutorCourse {
  id: number;
}

const CourseSidebar = ({ course, wishlisted, setWishlisted }: CourseSidebarProps) => {
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);
  const { toast } = useToast();

  // Kiểm tra user có phải tutor của khóa học
  useEffect(() => {
    const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

    if (!token) return;

    const checkTutorCourse = async () => {
      try {
        const res = await api.get("/tutor/courses/me");
        const myCourses: TutorCourse[] = res.data.result || [];
        const found = myCourses.some((c) => c.id === course.id);
        if (found) setIsOwner(true);
      } catch {
        // tránh lỗi không cần thiết
      }
    };

    checkTutorCourse();
  }, [course.id]);

  // Nếu khóa học đã được mua, xoá khỏi wishlist tự động
  useEffect(() => {
    if (course.isPurchased && wishlisted) {
      const removeWishlist = async () => {
        try {
          await api.delete(`/wishlist/${course.id}`);
          setWishlisted(false);
        } catch (error) {
          console.log("Failed to auto-remove wishlist:", error);
        }
      };
      removeWishlist();
    }
  }, [course.isPurchased, wishlisted, course.id]);

  // Toggle wishlist
  const toggleWishlist = async () => {
    const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

    if (!token) {
      const redirectURL = encodeURIComponent(window.location.pathname);
      navigate(`${ROUTES.SIGN_IN}?redirect=${redirectURL}`);
      toast({
        variant: "destructive",
        title: "You are not logged in",
        description: "Please login to use wishlist.",
      });
      return;
    }
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${course.id}`);
        setWishlisted(false);
        toast({
          variant: "success",
          title: "Removed from wishlist",
        });
      } else {
        await api.post(`/wishlist/${course.id}`);
        setWishlisted(true);
        toast({
          variant: "success",
          title: "Added to wishlist",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Something went wrong",
      });
    }
  };

  // Handle Buy Now
  const handleBuyNow = async () => {
    const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

    if (!token) {
      const redirectURL = encodeURIComponent(window.location.pathname);
      navigate(`${ROUTES.SIGN_IN}?redirect=${redirectURL}`);
      toast({
        title: "Login Required",
        description: "Please sign in before buying the course.",
        variant: "destructive",
      });
      return;
    }

    // LẤY USER ID
    const userId = await getUserId();

    if (!userId) {
      toast({
        title: "User Error",
        description: "Cannot detect user information.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await api.post("/api/payments/create", {
        userId,               // ✔ userID dạng number
        targetId: course.id,  // ✔ ID khóa học
        paymentType: "Course"
      });

      // Xóa khóa học khỏi wishlist nếu đã được thêm
      if (wishlisted) {
        await api.delete(`/wishlist/${course.id}`);
        setWishlisted(false);
      }

      // Điều hướng đến trang thanh toán nội bộ
      navigate(ROUTES.PAYMENT.replace(":id", String(course.id)), {
        state: {
          ...course,
          ...response.data,
        },
      });

    } catch {
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: "Unable to initialize payment.",
      });
    }
  };

  // Handle Go to Course
  const handleGoToCourse = () => navigate(`/learning/${course.id}`);
  const handleViewProfile = () =>
      navigate(ROUTES.TUTOR_DETAIL.replace(":id", `${course.tutorID}`));

  const totalLessons = course.section?.reduce(
      (total, sec) => total + sec.lessons.length,
      0
  );

  const formatPrice = (price: number) =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  return (
      <div className="lg:col-span-1">



        {/* Instructor Card */}
        <motion.div
            className="bg-white rounded-xl p-6 shadow-md mb-8"
            initial={{opacity: 0, y: 60}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.6}}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Instructor</h3>

          <div className="flex items-center space-x-4 mb-4">
            <img
                src={course.tutorAvatarURL || "https://placehold.co/150x150/png?text=Tutor"}
                alt={course.tutorName}
                className="w-16 h-16 rounded-full object-cover"
            />

            <div>
              <h4 className="font-semibold text-gray-900">{course.tutorName}</h4>
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

          <button
              onClick={handleViewProfile}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            View Profile
          </button>
        </motion.div>
        {/* Objectives Section */}
        <motion.div
            className="bg-white rounded-xl p-6 shadow-md mb-8"
            initial={{opacity: 0, y: 60}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.6}}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Objectives</h3>
          <ul className="list-disc pl-5 space-y-2">
            {course.objectives?.map((objective, index) => (
                <li key={index} className="text-gray-600">{objective}</li>
            ))}
          </ul>
        </motion.div>

        {/* Course Info */}
        <motion.div
            className="bg-white rounded-xl p-6 shadow-md mb-8"
            initial={{opacity: 0, y: 60}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.6}}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Course Information
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-500"/>
                <span className="text-gray-600">Duration</span>
              </div>
              <span className="font-medium">{course.duration} hours</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-gray-500"/>
                <span className="text-gray-600">Lessons</span>
              </div>
              <span className="font-medium">{totalLessons}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-gray-500"/>
                <span className="text-gray-600">Language</span>
              </div>
              <span className="font-medium">{course.language}</span>
            </div>

            {/* Content Summary Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Video Hours</span>
                <span className="font-medium">{course.contentSummary.totalVideoHours} hours</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Practice Tests</span>
                <span className="font-medium">{course.contentSummary.totalPracticeTests}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Articles</span>
                <span className="font-medium">{course.contentSummary.totalArticles}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Downloadable Resources</span>
                <span className="font-medium">{course.contentSummary.totalDownloadableResources}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment / Wishlist / Go To Course */}
        <motion.div
            className="bg-white rounded-xl p-6 shadow-md"
            initial={{opacity: 0, y: 60}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.6}}
        >
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-blue-600">
              {formatPrice(course.price)}
            </span>
          </div>

          {isOwner || course.isPurchased ? (
              <button
                  onClick={handleGoToCourse}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition mb-3"
              >
                Go to Course
              </button>
          ) : (
              <>
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
                  <Heart className={`w-5 h-5 ${wishlisted ? "fill-blue-600 text-blue-600" : ""}`}/>
                  {wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                </button>
              </>
          )}
        </motion.div>
      </div>
  );
};

export default CourseSidebar;
