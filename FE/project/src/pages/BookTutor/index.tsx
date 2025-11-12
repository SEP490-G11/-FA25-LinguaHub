import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TutorInfo from './components/sections/tutor-info';
import CalendarSlots from './components/sections/calendar-slots';
import BenefitsCommitment from './components/sections/benefits-commitment';
import BookingSummary from './components/sections/booking-summary';

const BookTutor = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState({
    courseName: '',
    notes: ''
  });

  const [selectedSlots, setSelectedSlots] = useState<Array<{ date: string; time: string; day: string }>>([]);

  const tutorData: { [key: string]: any } = {
    '1': {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
      language: 'English',
      country: 'United States',
      flag: '🇺🇸',
      rating: 4.9,
      reviews: 1250,
      hourlyRate: 25,
      specialties: ['Business English', 'IELTS', 'Conversation'],
      availability: ['Monday', 'Wednesday', 'Friday', 'Saturday']
    },
    '2': {
      id: '2',
      name: 'Carlos Rodriguez',
      avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400',
      language: 'Spanish',
      country: 'Spain',
      flag: '🇪🇸',
      rating: 4.8,
      reviews: 890,
      hourlyRate: 22,
      specialties: ['Grammar', 'Pronunciation', 'Culture'],
      availability: ['Tuesday', 'Thursday', 'Friday', 'Sunday']
    },
    '3': {
      id: '3',
      name: 'Marie Dubois',
      avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400',
      language: 'French',
      country: 'France',
      flag: '🇫🇷',
      rating: 4.9,
      reviews: 756,
      hourlyRate: 28,
      specialties: ['DELF/DALF', 'Literature', 'Business French'],
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
    }
  };

  const tutor = tutorData[tutorId || '1'];

  const calculateTotalPrice = () => {
    return (selectedSlots.length * tutor.hourlyRate).toFixed(2);
  };

  const handleBooking = () => {
    if (selectedSlots.length === 0) {
      alert('Please select at least one time slot');
      return;
    }

    console.log('Booking data:', {
      ...bookingData,
      tutorId: tutor.id,
      slots: selectedSlots,
      totalSlots: selectedSlots.length,
      pricePerSlot: tutor.hourlyRate,
      totalPrice: calculateTotalPrice()
    });

    navigate('/payment', {
      state: {
        booking: {
          ...bookingData,
          tutor,
          slots: selectedSlots,
          totalSlots: selectedSlots.length,
          pricePerSlot: tutor.hourlyRate,
          totalPrice: calculateTotalPrice()
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back</span>
          </button>
        </div>

        <div className="space-y-8">
          <TutorInfo tutor={tutor} />

          <CalendarSlots
            selectedSlots={selectedSlots}
            onSlotsChange={setSelectedSlots}
          />

          <BenefitsCommitment />

          <BookingSummary
            tutor={tutor}
            selectedSlots={selectedSlots}
            totalPrice={calculateTotalPrice()}
            onConfirmBooking={handleBooking}
          />
        </div>
      </div>
    </div>
  );
};

export default BookTutor;
