import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/config/axiosConfig";
import TutorInfo from "./components/sections/tutor-info";
import CalendarSlots, {
  SelectedSlot,
  PackageItem,
} from "./components/sections/calendar-slots";
import BenefitsCommitment from "./components/sections/benefits-commitment";
import BookingSummary from "./components/sections/booking-summary";
import { useUserInfo } from "@/hooks/useUserInfo";

/* -------------------------------------------------------------------------- */
/*                                 TYPES                                       */
/* -------------------------------------------------------------------------- */

interface Tutor {
  tutorId: number;
  name: string;
  avatarUrl?: string | null;
  country?: string;
  phone?: string | null;
  bio?: string | null;
  experience?: string | null;
  specialization?: string | null;
  teachingLanguage?: string | null;
  rating?: number;
  pricePerHour: number;
  courses?: unknown[];
}

const BookTutor = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();

  const { user, loading: userLoading } = useUserInfo();

  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------------------------- */
  /*                        FETCH TUTOR INFO + PACKAGES                         */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const loadTutorData = async () => {
      try {
        const tutorRes = await api.get(`/tutors/${tutorId}`);
        const raw = tutorRes.data;

        const normalizedTutor: Tutor = {
          tutorId: raw.tutorId || raw.id || Number(tutorId),
          name: raw.userName || raw.name || raw.fullName || "Unnamed Tutor",
          avatarUrl: raw.avatarURL || raw.avatarUrl || raw.image || null,
          country:
              raw.country && raw.country.trim() !== ""
                  ? raw.country
                  : raw.location || "Unknown",
          phone: raw.phone || raw.phoneNumber || null,
          bio: raw.bio || raw.description || null,
          experience: raw.experience || null,
          specialization: raw.specialization || raw.expertise || null,
          teachingLanguage: raw.teachingLanguage || raw.language || null,
          rating: raw.rating || raw.averageRating || 0,
          pricePerHour:
              raw.price_per_hours ||
              raw.pricePerHour ||
              raw.hourlyRate ||
              0,
          courses: raw.courses || [],
        };

        setTutor(normalizedTutor);

        const pkgRes = await api.get(`/tutor/${tutorId}/packages`);
        setPackages(pkgRes.data?.packages || []);

        setLoading(false);
      } catch (err) {
        console.error(" Error loading tutor:", err);
        setLoading(false);
      }
    };

    loadTutorData();
  }, [tutorId]);

  /* -------------------------------------------------------------------------- */
  /*                                  BOOKING                                   */
  /* -------------------------------------------------------------------------- */
  const handleBooking = async () => {
    if (selectedSlots.length === 0) {
      alert("Please select at least one slot.");
      return;
    }

    if (!user) {
      alert("You must sign in before booking.");
      navigate(`/sign-in?redirect=/tutor/${tutorId}`);
      return;
    }

    try {
      const formattedSlots = selectedSlots.map((slot) => {
        const [hour, minute] = slot.time.split(":");

        const startTime = `${slot.date}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
        const endTime = `${slot.date}T${String(Number(hour) + 1).padStart(2, "0")}:${minute.padStart(2, "0")}`;

        return { startTime, endTime };
      });

      const body = {
        userId: user.userID,
        targetId: selectedSlots[0].bookingPlanId,
        paymentType: "Booking",
        slots: formattedSlots,
      };

      console.log("📤 Sending Payment Request:", body);

      const res = await api.post("/api/payments/create", body);

      if (!res.data?.checkoutUrl) {
        alert("Cannot create payment.");
        return;
      }

      window.location.href = res.data.checkoutUrl;

    } catch (error) {
      console.error("❌ Payment error:", error);
      alert("Failed to create payment.");
    }
  };



  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  if (loading || userLoading)
    return <div className="text-center py-10">Loading...</div>;

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">

          <button
              onClick={() => navigate(-1)}
              className="mb-6 text-blue-600 hover:text-blue-700 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back</span>
          </button>

          <div className="space-y-8">
            <TutorInfo tutor={tutor!} />

            <CalendarSlots
                tutorId={String(tutorId)}
                selectedSlots={selectedSlots}
                onSlotsChange={setSelectedSlots}
                packages={packages}
            />

            <BenefitsCommitment />

            <BookingSummary
                tutor={tutor!}
                selectedSlots={selectedSlots}
                totalPrice={
                  selectedSlots.length > 0
                      ? (selectedSlots.length * tutor!.pricePerHour).toFixed(2)
                      : "0.00"
                }
                onConfirmBooking={handleBooking}
            />
          </div>
        </div>
      </div>
  );
};

export default BookTutor;
