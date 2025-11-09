import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/config/axiosConfig";
import TutorHeroSection from "./components/sections/hero-section";
import CoursesSection from "./components/sections/courses-section";
import ReviewsSection from "./components/sections/reviews-section";

interface Course {
  id: number;
  title: string;
  description: string;
  duration: number;
  price: number;
  language: string;
  thumbnailURL: string;
  categoryName: string;
  status: string;
}

interface Tutor {
  tutorId: number;
  userId: number;
  userName: string;
  userEmail: string;
  avatarURL: string | null;
  country: string | null;
  phone: string | null;
  bio: string | null;
  experience: string | null;
  specialization: string | null;
  teachingLanguage: string | null;
  rating: number;
  pricePerHour: number | null;
  status: string;
  courses: Course[];
}

const TutorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        const res = await api.get<Tutor>(`/tutors/${id}`);
        setTutor(res.data);
      } catch (err) {
        console.error(" Failed to fetch tutor:", err);
        setError("Không thể tải thông tin gia sư.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTutor();
  }, [id]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500 text-lg">Đang tải thông tin gia sư...</p>
        </div>
    );
  }

  if (error || !tutor) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500 text-lg">{error || "Gia sư không tồn tại."}</p>
        </div>
    );
  }

  const heroData = {
    id: tutor.tutorId,
    name: tutor.userName,
    language: tutor.teachingLanguage || "Unknown",
    country: tutor.country || "Unknown",
    rating: tutor.rating || 0,
    image: tutor.avatarURL || "https://placehold.co/600x400?text=No+Image",
    experience: tutor.experience || "Hollow",
    price: tutor.pricePerHour || 0,
    teachingLanguage: tutor.teachingLanguage || null,
    description:
        tutor.bio ||
        "There is currently no detailed description for this tutor. Please come back later.",
    specialties: tutor.specialization
        ? tutor.specialization.split(",").map((s) => s.trim())
        : [],
  };
  return (
      <div className="min-h-screen bg-gray-50">
        {/*  Hero Section */}
        <TutorHeroSection tutor={heroData} />
        {/*  Main Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <CoursesSection courses={tutor.courses || []}/>
                <ReviewsSection tutorId={tutor.tutorId}/>
              </div>
              {/* Sidebar có thể thêm thông tin liên hệ, rating, booking... */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Contact information</h3>
                  <p className="text-gray-600">
                    <strong>Email:</strong> {tutor.userEmail}
                  </p>
                  {tutor.phone && (
                      <p className="text-gray-600">
                        <strong>Phone:</strong> {tutor.phone}
                      </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
};

export default TutorDetail;
