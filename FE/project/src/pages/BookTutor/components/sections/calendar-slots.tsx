// ==========================================================
// FULL FILE — PLAN VIEW (Available / Selected / Booked)
// TYPE-SAFE — NO ANY
// ==========================================================

import { useState, useEffect } from "react";
import api from "@/config/axiosConfig";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PackageItem {
  packageId: number;
  tutorId: number;
  name: string;
  description: string;
  maxSlot: number;
  active: boolean;
  numberOfLessons: number;
  discountPercent: number;
}

export interface BookingPlan {
  booking_planid: number;
  tutor_id: number;
  title: string;
  date: string;
  start_hours: string;
  end_hours: string;
  slot_duration: number;
  price_per_hours: number;
  is_open: boolean;
  is_active: boolean;
  status?: "Locked" | "Open";
}

export interface SelectedSlot {
  date: string;
  time: string;
  day: string;
  bookingPlanId: number;
}

type PlanByDate = Record<string, BookingPlan[]>;

interface CalendarSlotsProps {
  tutorId: string;
  selectedSlots: SelectedSlot[];
  onSlotsChange: React.Dispatch<React.SetStateAction<SelectedSlot[]>>;
  packages: PackageItem[];
}

const formatDateFixed = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getPlanHour = (val: string): number => {
  return parseInt(val.substring(0, 2), 10);
};

const CalendarSlots = ({
                         tutorId,
                         selectedSlots,
                         onSlotsChange,
                         packages,
                       }: CalendarSlotsProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = local.getDay();
    const diff = local.getDate() - (day === 0 ? 6 : day - 1);
    return new Date(local.getFullYear(), local.getMonth(), diff);
  });

  const [planByDate, setPlanByDate] = useState<PlanByDate>({});

  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 11 }).map((_, i) => 6 + i); // 6 → 16

  const getWeekDates = () =>
      Array.from({ length: 7 }).map((_, i) => {
        const src = currentWeekStart;
        return new Date(src.getFullYear(), src.getMonth(), src.getDate() + i);
      });

  const weekDates = getWeekDates();

  // Load Plans
  useEffect(() => {
    const loadPlans = async () => {
      const planMap: PlanByDate = {};

      for (const date of weekDates) {
        const dateStr = formatDateFixed(date);

        try {
          const planRes = await api.get(
              `/booking-plan/tutor/${tutorId}?date=${dateStr}`
          );

          const rawPlans: BookingPlan[] = planRes.data.plans || [];

          planMap[dateStr] = rawPlans.filter(
              (p) => p.is_open === true && p.is_active === true
          );
        } catch  {
          planMap[dateStr] = [];
        }
      }

      setPlanByDate(planMap);
    };

    loadPlans();
  }, [currentWeekStart, tutorId]);

  const getStatus = (
      plan: BookingPlan,
      hour: number
  ): "available" | "selected" | "booked" | null => {
    const sH = getPlanHour(plan.start_hours);
    const eH = getPlanHour(plan.end_hours);

    if (!(hour >= sH && hour < eH)) return null;

    if (plan.status === "Locked") return "booked";

    const exist = selectedSlots.some(
        (s) => s.date === plan.date && s.time === `${hour}:00`
    );
    if (exist) return "selected";

    return "available";
  };

  return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* PACKAGE LIST */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-500" /> Tutor Packages
          </h2>

          {packages.length === 0 ? (
              <p className="text-gray-500 italic">No available packages</p>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                    <div
                        key={pkg.packageId}
                        className="border rounded-xl p-4 bg-blue-50 flex justify-between"
                    >
                      <div>
                        <h3 className="font-semibold">{pkg.name}</h3>
                        <p className="text-sm text-gray-600">{pkg.description}</p>
                        <p className="text-sm mt-3">
                          Max Sessions: <b>{pkg.maxSlot}</b>
                        </p>
                      </div>
                      <div>
                        {pkg.active ? (
                            <CheckCircle className="text-green-600" />
                        ) : (
                            <XCircle className="text-red-500" />
                        )}
                      </div>
                    </div>
                ))}
              </div>
          )}

          <div className="flex items-center gap-2 mt-6 pt-4 border-t text-gray-700 text-sm">
            <Award className="w-5 h-5 text-yellow-500" />
            Prices reflect tutor-defined booking plans.
          </div>
        </div>

        {/* WEEK NAV */}
        <div className="flex justify-between items-center mb-4">
          <Button
              variant="outline"
              onClick={() => {
                const d = new Date(currentWeekStart);
                d.setDate(d.getDate() - 7);
                setCurrentWeekStart(d);
              }}
          >
            <ChevronLeft className="w-4 h-4" /> Previous Week
          </Button>

          <div className="font-semibold text-lg">
            Week of {formatDateFixed(currentWeekStart)}
          </div>

          <Button
              variant="outline"
              onClick={() => {
                const d = new Date(currentWeekStart);
                d.setDate(d.getDate() + 7);
                setCurrentWeekStart(d);
              }}
          >
            Next Week <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* CALENDAR */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="text-blue-600" /> Select Available Plans
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
            <tr>
              <th className="border p-3 bg-gray-50">Hour</th>
              {weekDates.map((d, i) => (
                  <th key={i} className="border p-3 bg-gray-50 text-center">
                    {weekdayLabels[i]}
                    <div className="text-xs">{formatDateFixed(d)}</div>
                  </th>
              ))}
            </tr>
            </thead>

            <tbody>
            {hours.map((hour) => (
                <tr key={hour}>
                  <td className="border p-2 bg-gray-50 font-medium">
                    {hour}:00
                  </td>

                  {weekDates.map((date, col) => {
                    const dateStr = formatDateFixed(date);
                    const plans = planByDate[dateStr] || [];

                    const now = new Date();
                    const today = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate()
                    );

                    const day = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                    );

                    if (day < today)
                      return (
                          <td
                              key={col}
                              className="border p-2 text-center text-gray-300"
                          >
                            —
                          </td>
                      );

                    const isPastHour =
                        day.getTime() === today.getTime() &&
                        hour <= now.getHours();

                    if (isPastHour)
                      return (
                          <td
                              key={col}
                              className="border p-2 text-center text-gray-300"
                          >
                            —
                          </td>
                      );

                    if (plans.length === 0)
                      return (
                          <td
                              key={col}
                              className="border p-2 text-center text-gray-300"
                          >
                            —
                          </td>
                      );

                    let inside = false;
                    for (const p of plans) {
                      const sH = getPlanHour(p.start_hours);
                      const eH = getPlanHour(p.end_hours);
                      if (hour >= sH && hour < eH) inside = true;
                    }

                    if (!inside)
                      return (
                          <td
                              key={col}
                              className="border p-2 text-center text-gray-300"
                          >
                            —
                          </td>
                      );

                    return (
                        <td key={col} className="border p-2 text-center">
                          <div className="flex flex-col gap-1">
                            {plans.map((p) => {
                              const sH = getPlanHour(p.start_hours);
                              const eH = getPlanHour(p.end_hours);
                              if (!(hour >= sH && hour < eH)) return null;

                              const status = getStatus(p, hour);

                              const styleMap: Record<string, string> = {
                                available:
                                    "bg-green-100 border border-green-500 text-green-700 hover:bg-green-200",
                                selected:
                                    "bg-blue-100 border border-blue-500 text-blue-700 hover:bg-blue-200",
                                booked:
                                    "bg-red-100 border border-red-500 text-red-600 cursor-not-allowed",
                              };

                              return (
                                  <button
                                      key={p.booking_planid}
                                      className={`w-full h-10 rounded-lg text-sm font-semibold ${styleMap[status!]}`}
                                      disabled={status === "booked"}
                                      onClick={() => {
                                        if (status === "booked") return;

                                        onSlotsChange(
                                            (prev: SelectedSlot[]): SelectedSlot[] => {
                                              if (status === "selected") {
                                                return prev.filter(
                                                    (x) =>
                                                        !(
                                                            x.date === p.date &&
                                                            x.time === `${hour}:00`
                                                        )
                                                );
                                              }

                                              return [
                                                ...prev,
                                                {
                                                  date: p.date,
                                                  time: `${hour}:00`,
                                                  day: weekdayLabels[col],
                                                  bookingPlanId: p.booking_planid,
                                                },
                                              ];
                                            }
                                        );
                                      }}
                                  >
                                    {status === "available" && "Available"}
                                    {status === "selected" && "Selected"}
                                    {status === "booked" && "Booked"}
                                  </button>
                              );
                            })}
                          </div>
                        </td>
                    );
                  })}
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default CalendarSlots;
