import { useState } from 'react';
import { CourseDetail } from '@/queries/admin-api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';

interface CourseDetailModalProps {
  isOpen: boolean;
  course: CourseDetail;
  onClose: () => void;
  onApprove: (courseId: string, notes?: string) => Promise<void>;
  onReject: (courseId: string, reason: string) => Promise<void>;
  isLoading: boolean;
}

export function CourseDetailModal({
  isOpen,
  course,
  onClose,
  onApprove,
  onReject,
  isLoading,
}: CourseDetailModalProps) {
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Handle approve action
   */
  const handleApprove = async () => {
    try {
      setValidationError(null);
      await onApprove(course.id, adminNotes);
      setAdminNotes('');
      setShowRejectForm(false);
    } catch (error: any) {
      setValidationError(error.message);
    }
  };

  /**
   * Handle reject action
   */
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setValidationError('Please provide a reason for rejection');
      return;
    }
    
    try {
      setValidationError(null);
      await onReject(course.id, rejectionReason);
      setRejectionReason('');
      setShowRejectForm(false);
    } catch (error: any) {
      setValidationError(error.message);
    }
  };

  /**
   * Handle cancel rejection form
   */
  const handleCancelReject = () => {
    setShowRejectForm(false);
    setRejectionReason('');
    setValidationError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        {/* ========== Header ========== */}
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Review Course: {course.title}
          </DialogTitle>
        </DialogHeader>

        {/* ========== Validation Error ========== */}
        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{validationError}</p>
          </div>
        )}

        {/* ========== Content Scroll Area ========== */}
        <div className="space-y-6">
          {/* ========== Course Header ========== */}
          <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-48 object-cover rounded mb-4 bg-gray-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              {course.title}
            </h2>
            <p className="text-gray-700 mb-4 line-clamp-3">{course.description}</p>

            {/* Course Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">
                  Category
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {course.category?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">
                  Price
                </p>
                <p className="text-sm font-medium text-gray-900">
                  ₫{course.price_vnd.toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">
                  Duration
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {course.duration_hours} hours
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">
                  Tutor
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {course.tutor?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">
                  Tutor Email
                </p>
                <p className="text-sm font-medium text-gray-900 break-all">
                  {course.tutor?.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">
                  Created
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(course.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* ========== Languages ========== */}
          {course.languages && course.languages.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {course.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ========== Course Content (Sections & Lessons) ========== */}
          {course.sections && course.sections.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Course Content ({course.sections.length} sections)
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {course.sections.map((section, sectionIdx) => (
                  <details
                    key={sectionIdx}
                    className="border rounded-lg p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                  >
                    <summary className="font-medium text-gray-900 flex items-center justify-between">
                      <span>
                        {sectionIdx + 1}. {section.title}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {section.lessons?.length || 0} lessons
                      </span>
                    </summary>

                    {section.description && (
                      <p className="text-sm text-gray-600 mt-2 mb-3">
                        {section.description}
                      </p>
                    )}

                    {section.lessons && section.lessons.length > 0 && (
                      <div className="mt-3 ml-4 space-y-2 border-l-2 border-gray-300 pl-3">
                        {section.lessons.map((lesson, lessonIdx) => (
                          <div key={lessonIdx} className="text-sm">
                            <p className="text-gray-900 font-medium">
                              Lesson {lessonIdx + 1}: {lesson.title}
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                              Duration: {lesson.duration_minutes} minutes
                            </p>
                            {lesson.video_url && (
                              <a
                                href={lesson.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs mt-1 inline-block"
                              >
                                🎥 View Video
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* ========== Admin Notes / Rejection Reason ========== */}
          {!showRejectForm && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Admin Notes <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <Textarea
                placeholder="Add any notes for the tutor or for your records..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full"
                rows={3}
              />
            </div>
          )}

          {/* ========== Rejection Reason ========== */}
          {showRejectForm && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Rejection Reason <span className="text-red-600">*</span>
              </label>
              <Textarea
                placeholder="Please provide a detailed reason for rejection. This will be sent to the tutor..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full"
                rows={4}
              />
            </div>
          )}
        </div>

        {/* ========== Footer Actions ========== */}
        <DialogFooter className="flex gap-3 justify-between">
          {/* Cancel Button */}
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </Button>

          {/* Approval or Rejection Buttons */}
          {!showRejectForm ? (
            <>
              {/* Reject Button */}
              <Button
                variant="destructive"
                onClick={() => setShowRejectForm(true)}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>

              {/* Approve Button */}
              <Button
                onClick={handleApprove}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Approve
              </Button>
            </>
          ) : (
            <>
              {/* Cancel Rejection */}
              <Button
                variant="outline"
                onClick={handleCancelReject}
                disabled={isLoading}
              >
                Cancel
              </Button>

              {/* Confirm Rejection */}
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                Confirm Rejection
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
