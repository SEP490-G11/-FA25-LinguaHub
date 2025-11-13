import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Users,
  BookOpen,
  Video,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import api from "@/config/axiosConfig";
import { ROUTES } from "@/constants/routes";

interface TutorHeroSectionProps {
  tutor: {
    id: number;
    name: string;
    language: string;
    country: string;
    rating: number;
    price: number;
    specialties: string[];
    description: string;
    image: string;
    experience?: string;
    coverImage?: string;
    teachingLanguage: string | null;
  };
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);
};

const TutorHeroSection = ({ tutor }: TutorHeroSectionProps) => {
  const navigate = useNavigate();

  // Animation preset
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const handleSendMessage = async () => {
    try {
      // 1️⃣ Lấy thông tin user
      const userRes = await api.get("/users/myInfo");
      const myInfo = userRes.data.result;

      // 2️⃣ Check xem user có đang xem chính profile của mình không
      if (myInfo.userID === tutor.id) {
        return alert("You cannot create a chat room with yourself.");
      }

      // 3️⃣ Gọi BE (BE sẽ tự xác định Advice/Training)
      const res = await api.post(`/chat/advice/${tutor.id}`);
      const room = res.data?.result;

      if (!room?.chatRoomID) {
        console.error("❌ Backend missing chatRoomID:", res.data);
        return alert("Unable to create chat room.");
      }

      // 4️⃣ Điều hướng FE
      navigate(`/messages/${room.chatRoomID}`);
    } catch (err: any) {
      // Nếu BE trả 401 → chưa login
      if (err?.response?.status === 401) {
        return navigate(ROUTES.SIGN_IN);
      }

      console.error("❌ Error opening chat:", err);
      alert("Something went wrong.");
    }
  };




  // ========= Render =========
  return (
      <section className="relative">
        {/* Background / Cover */}
        <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-700 relative overflow-hidden">
          <img
              src={
                  tutor.coverImage ||
                  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&w=1200&q=80"
              }
              alt="Background"
              className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="max-w-7xl mx-auto px-8 lg:px-16 relative -mt-32">
          <motion.div
              className="bg-white rounded-2xl shadow-xl p-8"
              initial="initial"
              animate="animate"
              variants={fadeInUp}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="lg:col-span-2">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                  <img
                      src={
                          tutor.image || "https://placehold.co/200x200?text=No+Image"
                      }
                      alt={tutor.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {tutor.name}
                    </h1>

                    <p className="text-lg text-blue-600 font-medium mb-2">
                      {tutor.language || "Unknown"} Tutor
                    </p>

                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                      {tutor.country || "Unknown Country"}
                    </span>
                    </div>

                    <div className="flex items-center flex-wrap gap-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                        {tutor.rating?.toFixed(1) || "5.0"}
                      </span>
                        <span className="text-gray-500">(Evaluate)</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Users className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-600">
                        Teaching language: {tutor.teachingLanguage}
                      </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <BookOpen className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-600">
                      Experience: {tutor.experience || "Not updated yet"}
                    </span>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                {tutor.specialties.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Specialties
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {tutor.specialties.map((specialty, index) => (
                            <Badge
                                key={index}
                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {specialty}
                            </Badge>
                        ))}
                      </div>
                    </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">About Me</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {tutor.description ||
                        "This tutor does not have a detailed description yet. Please come back later.."}
                  </p>
                </div>
              </div>

              {/* Booking Card */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-2 space-x-2">
                    <span className="text-3xl font-bold text-green-500">
                      {formatPrice(tutor.price)}
                    </span>
                      <span className="text-gray-500">/slot</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Sign up now to get the best slot
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <Button
                        onClick={() => navigate(`/book-tutor/${tutor.id}`)}
                        className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Video className="w-5 h-5" />
                      <span>Booking</span>
                    </Button>

                    <Button
                        onClick={handleSendMessage}
                        variant="outline"
                        className="w-full border border-blue-500 text-blue-500 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Send Message Now</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
  );
};

export default TutorHeroSection;
