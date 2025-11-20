import { useState, useEffect } from 'react';
import api from '@/config/axiosConfig.ts';

import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

/* =======================================================
   HERO SECTION
   ======================================================= */
const HeroSection = ({ stats }: { stats: any }) => {
    return (
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-lg p-8 text-white mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
                    <p className="text-blue-100 text-lg">Track and manage all your learning sessions</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatBox label="Upcoming" value={stats.upcoming} icon={<Clock className="w-4 h-4 text-blue-200" />} />
                    <StatBox label="Expired" value={stats.expired} icon={<XCircle className="w-4 h-4 text-red-300" />} />
                    <StatBox label="Total Slots" value={stats.totalSlots} icon={<Calendar className="w-4 h-4 text-blue-200" />} />
                    <StatBox label="Total Hours" value={stats.totalHours} icon={<CheckCircle className="w-4 h-4 text-green-300" />} />
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-sm text-blue-100 font-medium">{label}</span>
        </div>
        <p className="text-3xl font-bold">{value}</p>
    </div>
);

/* =======================================================
   CALENDAR VIEW
   ======================================================= */
// API Response từ backend (snake_case)
interface BookingSlotAPI {
    slotid: number;
    booking_planid: number;
    tutor_id: number;
    user_id: number;
    start_time: string;
    end_time: string;
    payment_id: number;
    status: string;
    locked_at: string;
    expires_at: string;
    learner_name: string | null;
    meeting_url: string | null;
}

// Interface sử dụng trong component (camelCase)
interface BookingSlot {
    slotID: number;
    bookingPlanID: number;
    tutorID: number;
    userID: number;
    startTime: string;
    endTime: string;
    paymentID: number;
    status: string;
    lockedAt: string;
    expiresAt: string;
    learnerName: string | null;
    meetingUrl: string | null;
}

const CalendarView = ({ 
    onSelectDate, 
    selectedDate, 
    bookings, 
    userID 
}: { 
    onSelectDate: (date: string) => void; 
    selectedDate: string | null;
    bookings: BookingSlot[];
    userID: number | null;
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onSelectDate(dateStr);
    };

    // Check if a date has bookings
    const hasBooking = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return bookings.some((b) => {
            const bookingDate = new Date(b.startTime).toISOString().split('T')[0];
            return bookingDate === dateStr && b.userID === userID;
        });
    };

    // Create array with empty slots for days before first day of month
    const emptyDays: (number | null)[] = Array.from({ length: firstDayOfMonth }, () => null);
    const monthDays: (number | null)[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const calendarDays = [...emptyDays, ...monthDays];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-700" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((d) => (
                    <div key={d} className="text-center font-bold text-sm text-slate-600 py-2">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isSelected = selectedDate === dateStr;
                    const hasSlot = hasBooking(day);

                    return (
                        <div
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={`aspect-square rounded-xl border-2 p-2 cursor-pointer transition-all ${
                                isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                    : hasSlot
                                    ? 'bg-blue-50 border-blue-400 hover:bg-blue-100 hover:border-blue-500'
                                    : 'border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                            }`}
                        >
                            <div className={`text-sm font-bold ${isSelected ? 'text-white' : hasSlot ? 'text-blue-700' : 'text-slate-700'}`}>
                                {day}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* =======================================================
   UPCOMING SESSIONS (SIDEBAR)
   ======================================================= */

const UpcomingSessions = ({ bookings, selectedDate, userID }: { bookings: BookingSlot[]; selectedDate: string | null; userID: number | null }) => {
    if (!selectedDate) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center py-8">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Please select a date</p>
            </div>
        );
    }

    // Filter bookings by selected date and userID
    const filteredBookings = bookings.filter((b) => {
        const bookingDate = new Date(b.startTime).toISOString().split('T')[0];
        return bookingDate === selectedDate && b.userID === userID;
    });

    if (filteredBookings.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center py-8">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No sessions for this date</p>
            </div>
        );
    }

    const now = new Date();

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Sessions on {selectedDate}</h3>

            <div className="space-y-3">
                {filteredBookings.map((booking) => {
                    const startTime = new Date(booking.startTime);
                    const endTime = new Date(booking.endTime);
                    const isPast = endTime < now;

                    return (
                        <div
                            key={booking.slotID}
                            className={`rounded-xl p-4 border ${
                                isPast
                                    ? 'bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-300'
                                    : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className={`w-4 h-4 ${isPast ? 'text-slate-500' : 'text-blue-600'}`} />
                                <span className={`font-semibold ${isPast ? 'text-slate-600' : 'text-slate-900'}`}>
                                    {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="text-sm text-slate-600 space-y-1">
                                <div>
                                    Status: <span className={`font-medium ${isPast ? 'text-slate-500' : 'text-blue-600'}`}>
                                        {isPast ? 'Past Session' : booking.status}
                                    </span>
                                </div>
                                <div>Slot ID: {booking.slotID}</div>
                                
                                {/* Google Meet Link */}
                                {booking.meetingUrl ? (
                                    <div className="mt-2 pt-2 border-t border-slate-200">
                                        <a
                                            href={booking.meetingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                isPast
                                                    ? 'bg-slate-200 text-slate-600 cursor-not-allowed'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                            onClick={(e) => {
                                                if (isPast) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 8.449-11.985 8.449c-7.18 0-12.015-8.449-12.015-8.449s4.446-7.551 12.015-7.551c7.694 0 11.985 7.551 11.985 7.551zm-7 .449c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5z"/>
                                            </svg>
                                            {isPast ? 'Meeting Ended' : 'Join Google Meet'}
                                        </a>
                                    </div>
                                ) : (
                                    <div className="mt-2 pt-2 border-t border-slate-200">
                                        <span className="text-xs text-slate-500 italic">
                                            Meeting link not available yet
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};



/* =======================================================
   MAIN PAGE — MY BOOKINGS
   ======================================================= */
const MyBookings = () => {
    const [bookings, setBookings] = useState<BookingSlot[]>([]);
    const [userID, setUserID] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Fetch user ID
    useEffect(() => {
        api.get('/users/myInfo').then((res) => {
            setUserID(res.data.result?.userID);
        });
    }, []);

    // Fetch bookings
    useEffect(() => {
        if (!userID) return;
        api.get('/booking-slots/my-slots').then((res) => {
            // Map API response (snake_case) to component interface (camelCase)
            const apiSlots: BookingSlotAPI[] = res.data.result || [];
            const mappedSlots: BookingSlot[] = apiSlots
                .filter((b) => b.user_id === userID)
                .map((b) => ({
                    slotID: b.slotid,
                    bookingPlanID: b.booking_planid,
                    tutorID: b.tutor_id,
                    userID: b.user_id,
                    startTime: b.start_time,
                    endTime: b.end_time,
                    paymentID: b.payment_id,
                    status: b.status,
                    lockedAt: b.locked_at,
                    expiresAt: b.expires_at,
                    learnerName: b.learner_name,
                    meetingUrl: b.meeting_url,
                }));
            setBookings(mappedSlots);
        });
    }, [userID]);

    const calculateStats = () => {
        const now = new Date();
        
        const upcomingSlots = bookings.filter((b) => {
            const endTime = new Date(b.endTime);
            return endTime >= now;
        });
        
        const expiredSlots = bookings.filter((b) => {
            const endTime = new Date(b.endTime);
            return endTime < now;
        });
        
        const totalHours = bookings.reduce((acc, b) => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);
            return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }, 0);

        return {
            upcoming: upcomingSlots.length,
            expired: expiredSlots.length,
            totalSlots: bookings.length,
            totalHours: Math.round(totalHours),
        };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-8">

                <HeroSection stats={calculateStats()} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <CalendarView 
                            onSelectDate={setSelectedDate} 
                            selectedDate={selectedDate}
                            bookings={bookings}
                            userID={userID}
                        />
                    </div>

                    <div>
                        <UpcomingSessions bookings={bookings} selectedDate={selectedDate} userID={userID} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MyBookings;
