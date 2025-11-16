import { MapPin, Phone, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Tutor {
  tutorId: number;
  name: string;
  avatarUrl?: string | null;
  country?: string;
  phone?: string | null;
  bio?: string | null;
  experience?: string | null;
  specialization?: string | null;

  /** 🔥 Bổ sung để BookingSummary không lỗi */
  teachingLanguage?: string | null;
  language?: string | null;

  rating?: number;
  pricePerHour?: number;
}

interface TutorInfoProps {
  tutor: Tutor;
}

const TutorInfo = ({ tutor }: TutorInfoProps) => {
  const initials = tutor?.name
      ? tutor.name.split(" ").map((n) => n[0]?.toUpperCase()).join("")
      : "T";

  const avatarSrc =
      tutor?.avatarUrl && tutor.avatarUrl.trim() !== ""
          ? tutor.avatarUrl
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
              tutor?.name || "Tutor"
          )}&background=random&size=256`;

  return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-start gap-4 pb-6 ">
          <Avatar className="w-20 h-20 rounded-full border shadow-sm">
            <AvatarImage src={avatarSrc} alt={tutor.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">{tutor.name}</h1>

            {/* LANGUAGE */}
            {tutor.language || tutor.teachingLanguage ? (
                <p className="mt-1 text-gray-600">
                  🌐 Teaching Language:{" "}
                  <b>{tutor.language || tutor.teachingLanguage}</b>
                </p>
            ) : null}

            <div className="mt-2 text-gray-700 space-y-1 text-sm">
              {tutor.country && (
                  <p className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    {tutor.country}
                  </p>
              )}

              {tutor.phone && (
                  <p className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-green-500" />
                    {tutor.phone}
                  </p>
              )}

              {typeof tutor.rating === "number" && (
                  <p className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Rating: {tutor.rating.toFixed(1)}/5.0
                  </p>
              )}

              {tutor.pricePerHour && tutor.pricePerHour > 0 && (
                  <p>
                    💰 Price per hour:{" "}
                    <span className="font-semibold">
                  {tutor.pricePerHour.toLocaleString()} VND
                </span>
                  </p>
              )}
            </div>

            {tutor.bio && (
                <p className="text-gray-700 mt-3 leading-relaxed">{tutor.bio}</p>
            )}
          </div>
        </div>
      </div>
  );
};

export default TutorInfo;
