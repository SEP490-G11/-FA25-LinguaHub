import { useEffect, useState } from "react";
import api from "@/config/axiosConfig";
import {
  MapPin,
  Phone,
  Star,
  Users,
  BookOpen,
  Award,
  Clock,
} from "lucide-react";
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

  teachingLanguage?: string | null;
  language?: string | null;

  rating?: number;
  pricePerHour?: number;

  studentsCount?: number;
  lessonsCount?: number;
}

/* ---------------------- TYPE FOR BOOKING PLAN ---------------------- */
export interface BookingPlan {
  booking_planid: number;
  tutor_id: number;
  title: string; // e.g., "T2", "T3"
  start_hours: string; // HH:mm
  end_hours: string;   // HH:mm
  is_open: boolean;
  is_active: boolean;
}

interface TutorInfoProps {
  tutor: Tutor;
}

const weekdayMap: Record<string, string> = {
  T2: "Mon",
  T3: "Tue",
  T4: "Wed",
  T5: "Thu",
  T6: "Fri",
  T7: "Sat",
  CN: "Sun",
};

const TutorInfo = ({ tutor }: TutorInfoProps) => {
  const initials = tutor.name
      ? tutor.name
          .split(" ")
          .map((n) => n[0]?.toUpperCase())
          .join("")
      : "T";

  const avatarSrc =
      tutor.avatarUrl && tutor.avatarUrl.trim() !== ""
          ? tutor.avatarUrl
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
              tutor?.name || "Tutor"
          )}&background=random&size=256`;

  /* ---------------------- STATE FOR SCHEDULE ---------------------- */
  const [schedule, setSchedule] = useState<
      { day: string; start: string; end: string }[]
  >([]);

  /* ---------------------- LOAD WEEKLY SCHEDULE ---------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/tutor/${tutor.tutorId}/booking-plan`);

        const plans: BookingPlan[] = res.data?.plans || [];

        const formatted = plans
            .filter((p) => p.is_active && p.is_open)
            .map((p) => ({
              day: weekdayMap[p.title] || p.title,
              start: p.start_hours,
              end: p.end_hours,
            }))
            .sort(
                (a, b) =>
                    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(a.day) -
                    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(b.day)
            );

        setSchedule(formatted);
      } catch (err) {
        console.log("Schedule load error:", err);
      }
    };

    load();
  }, [tutor.tutorId]);

  return (
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="col-span-2 flex items-start gap-4">
            <Avatar className="w-20 h-20 rounded-full border shadow-sm">
              <AvatarImage src={avatarSrc} alt={tutor.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-2xl font-bold">{tutor.name}</h1>

              {tutor.language || tutor.teachingLanguage ? (
                  <p className="mt-1 text-gray-600">
                    🌐 Teaching Language: <b>{tutor.language || tutor.teachingLanguage}</b>
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

          {/* RIGHT SIDE */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-blue-900 text-lg mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Tutor Summary
            </h3>

            <div className="space-y-3 text-sm text-gray-700">
              {tutor.specialization && (
                  <p className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <b>Specialization:</b> {tutor.specialization}
                  </p>
              )}

              {tutor.experience && (
                  <p className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-500" />
                    <b>Experience:</b> {tutor.experience}
                  </p>
              )}

              {typeof tutor.studentsCount === "number" && (
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-700" />
                    <b>Students taught:</b> {tutor.studentsCount}
                  </p>
              )}

              {typeof tutor.lessonsCount === "number" && (
                  <p className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <b>Lessons completed:</b> {tutor.lessonsCount}
                  </p>
              )}

              {/* WEEKLY SCHEDULE */}
              <div className="pt-2 border-t border-blue-200">
                <p className="flex items-center gap-2 text-blue-900 font-semibold mb-1">
                  <Clock className="w-4 h-4 text-blue-700" />
                  Weekly Schedule
                </p>

                <div className="text-sm space-y-1">
                  {schedule.length === 0 && (
                      <p className="text-gray-500 italic">No schedule available</p>
                  )}

                  {schedule.map((s, idx) => (
                      <p key={idx} className="flex justify-between text-gray-700 px-1">
                        <span className="font-medium w-10">{s.day}</span>
                        <span>
                      {s.start} – {s.end}
                    </span>
                      </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TutorInfo;
