import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/config/axiosConfig";
import TutorHeroSection from "./components/sections/hero-section";
import CoursesSection from "./components/sections/courses-section";
import ReviewsSection from "./components/sections/reviews-section";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { ROUTES } from "@/constants/routes";

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

interface PackageItem {
  name: string;
  description: string;
  packageid: number;
  tutor_id: number;
  max_slot: number;
  is_active: boolean;
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
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);
  const navigate = useNavigate();

  // FETCH TUTOR
  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tutors/${id}`, { skipAuth: true });
        setTutor(res.data);
      } catch (err) {
        console.error("Failed to fetch tutor:", err);
        setError("Không thể tải thông tin gia sư.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTutor();
  }, [id]);

  // FETCH PACKAGES — FIXED
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoadingPackages(true);
        const res = await api.get(`/tutor/${id}/packages`, { skipAuth: true });

        setPackages(res.data.packages || []);
      } catch (err) {
        console.error("Failed to fetch packages:", err);
      } finally {
        setLoadingPackages(false);
      }
    };

    if (id) fetchPackages();
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

  const checkAuthAndRedirect = () => {
    const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

    if (!token) {
      const redirectURL = encodeURIComponent(window.location.pathname);
      navigate(`${ROUTES.SIGN_IN}?redirect=${redirectURL}`);
      return false;
    }
    return true;
  };

  const heroData = {
    id: tutor.tutorId,
    name: tutor.userName,
    language: tutor.teachingLanguage || "Unknown",
    country: tutor.country || "Unknown",
    rating: tutor.rating || 0,
    image: tutor.avatarURL || "https://placehold.co/600x400?text=No+Image",
    experience: tutor.experience || "Hollow",
    price: tutor.pricePerHour || 0,
    teachingLanguage: tutor.teachingLanguage,
    description:
        tutor.bio ||
        "There is currently no detailed description for this tutor. Please come back later.",
    specialties: tutor.specialization
        ? tutor.specialization.split(",").map((s) => s.trim())
        : [],
  };

  return (
      <div className="min-h-screen bg-gray-50">
        {/* HERO SECTION */}
        <TutorHeroSection tutor={heroData} />

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* LEFT SIDE */}
              <div className="lg:col-span-2 space-y-12">

                {/* PACKAGES */}
                <div className="bg-white shadow-md rounded-xl p-6">
                  <h2 className="text-2xl font-bold mb-4">Tutor Packages</h2>

                  {loadingPackages ? (
                      <p className="text-gray-500">Đang tải gói học...</p>
                  ) : packages.length === 0 ? (
                      <p className="text-gray-500 italic">Không có gói học nào.</p>
                  ) : (
                      <div className="flex flex-col gap-6">

                        {/* ONE PACKAGE ONLY */}
                        <div className="border rounded-xl p-5 bg-blue-50">
                          <h3 className="text-xl font-semibold">
                            {packages[currentPackageIndex].name}
                          </h3>

                          <p className="text-gray-700 mt-1">
                            {packages[currentPackageIndex].description}
                          </p>

                          <div className="mt-3 text-sm grid grid-cols-2 gap-2">
                            <p>
                              Max Slots:{" "}
                              <b>{packages[currentPackageIndex].max_slot}</b>
                            </p>
                            <p>
                              Status:{" "}
                              {packages[currentPackageIndex].is_active ? (
                                  <span className="text-green-600 font-semibold">
                              Active
                            </span>
                              ) : (
                                  <span className="text-red-600 font-semibold">
                              Inactive
                            </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* PAGINATION */}
                        <div className="flex justify-between">
                          <button
                              className={`px-4 py-2 rounded-lg text-white ${
                                  currentPackageIndex === 0
                                      ? "bg-gray-300 cursor-not-allowed"
                                      : "bg-blue-500 hover:bg-blue-600"
                              }`}
                              disabled={currentPackageIndex === 0}
                              onClick={() => setCurrentPackageIndex((prev) => prev - 1)}
                          >
                            ⬅ Previous
                          </button>

                          <button
                              className={`px-4 py-2 rounded-lg text-white ${
                                  currentPackageIndex === packages.length - 1
                                      ? "bg-gray-300 cursor-not-allowed"
                                      : "bg-blue-500 hover:bg-blue-600"
                              }`}
                              disabled={currentPackageIndex === packages.length - 1}
                              onClick={() => setCurrentPackageIndex((prev) => prev + 1)}
                          >
                            Next ➡
                          </button>
                        </div>
                      </div>
                  )}
                </div>

                {/* COURSES */}
                <CoursesSection courses={tutor.courses || []} />

                {/* REVIEWS */}
                <ReviewsSection tutorId={tutor.tutorId} />
              </div>

              {/* RIGHT SIDEBAR */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-2">Tutor Information</h3>

                  <p className="text-gray-800 text-lg font-semibold mb-3">
                    {tutor.userName}
                  </p>

                  <p className="text-gray-600">
                    <strong>Email:</strong> {tutor.userEmail}
                  </p>

                  {tutor.phone && (
                      <p className="text-gray-600">
                        <strong>Phone:</strong> {tutor.phone}
                      </p>
                  )}
                </div>

                {/* BOOKING CARD */}
                <div className="mt-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-2xl font-bold mb-2">Book Your First Trial Lesson!</h3>
                  <p className="text-white/90 text-sm mb-4">
                    Experience personalized learning with expert tutors. Schedule your trial lesson today and start your journey!
                  </p>

                  <ul className="text-sm space-y-2 mb-4">
                    <li className="flex items-center gap-2">
                      <span className="text-green-300">✔</span>
                      1-on-1 private learning session
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-300">✔</span>
                      Customized study plan
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-300">✔</span>
                      Flexible schedule & instant booking
                    </li>
                  </ul>

                  <Button
                      onClick={() => {
                        if (!checkAuthAndRedirect()) return;
                        navigate(`/book-tutor/${tutor.tutorId}`);
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold"
                  >
                    <Video className="w-5 h-5" />
                    <span>Booking</span>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
  );
};

export default TutorDetail;
