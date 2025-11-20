import React, { memo } from 'react';
import { BookedSlot, SlotStatus } from '../types';
import { Clock, Link as LinkIcon, User } from 'lucide-react';

interface BookedSlotCardProps {
  slot: BookedSlot;
  onClick?: () => void;
}

// Color scheme matching Schedule page: blue (#2563eb), green (#16a34a), red (#dc2626), yellow (#eab308)
const getStatusColor = (status: SlotStatus): string => {
  switch (status) {
    case 'Available':
      return 'border-gray-300 bg-gray-50';
    case 'Booked':
      return 'border-blue-600 bg-blue-50'; // Using blue-600 to match Schedule
    case 'Completed':
      return 'border-green-600 bg-green-50'; // Using green-600 to match Schedule
    case 'Cancelled':
      return 'border-red-600 bg-red-50'; // Using red-600 to match Schedule
    default:
      return 'border-gray-300 bg-gray-50';
  }
};

const getStatusBadgeColor = (status: SlotStatus): string => {
  switch (status) {
    case 'Available':
      return 'bg-gray-100 text-gray-700';
    case 'Booked':
      return 'bg-blue-100 text-blue-700';
    case 'Completed':
      return 'bg-green-100 text-green-700';
    case 'Cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const BookedSlotCard: React.FC<BookedSlotCardProps> = memo(({ slot, onClick }) => {
  const statusColor = getStatusColor(slot.status);
  const statusBadgeColor = getStatusBadgeColor(slot.status);
  const startTime = formatTime(slot.start_time);
  const endTime = formatTime(slot.end_time);

  return (
    <div
      className={`border-2 rounded-lg p-2 transition-all duration-200 hover:shadow-sm ${statusColor} ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
      onClick={onClick}
    >
      {/* Header with learner name and status - consistent spacing */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3 text-gray-600" />
          <span className="font-semibold text-sm text-gray-900">{slot.learner_name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadgeColor}`}>
          {slot.status}
        </span>
      </div>

      {/* Time range - consistent typography */}
      <div className="flex items-center gap-1 mb-1">
        <Clock className="w-3 h-3 text-gray-600" />
        <span className="text-xs text-gray-700">
          {startTime} - {endTime}
        </span>
      </div>

      {/* Meeting URL if available - matching Schedule page link styling */}
      {slot.meeting_url && (
        <div className="flex items-center gap-1">
          <LinkIcon className="w-3 h-3 text-blue-600" />
          <a
            href={slot.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline truncate"
            onClick={(e) => e.stopPropagation()}
          >
            Join Meeting
          </a>
        </div>
      )}
    </div>
  );
});

BookedSlotCard.displayName = 'BookedSlotCard';
