import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TutorApplicationForm } from './components/sections/tutor-application-form';
import { ApplicationStatus } from './components/sections/application-status';
// supabase removed — using REST API endpoints/localStorage
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface TutorApplication {
  id: string;
  status: string;
  rejection_reason: string | null;
  submitted_at: string;
  teaching_languages: string[];
  specialization: string;
  experience: number;
  bio: string;
  certificate_name: string;
}

export default function ApplyTutor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [existingApplication, setExistingApplication] = useState<TutorApplication | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkExistingApplication();
  }, []);

  const checkExistingApplication = async () => {
    try {
  // Check for user in localStorage (set by your auth flow). If not present,
  // optionally allow a temporary bypass for dev/testing.
  const TEMP_BYPASS_LEARNER_APPLY = true;
      const storedUser = localStorage.getItem('user_data');

      if (!storedUser) {
        if (TEMP_BYPASS_LEARNER_APPLY) {
          console.warn('[ApplyTutor] TEMP_BYPASS_LEARNER_APPLY is enabled. Using mock user id.');
          setUserId('mock-learner-id');
          setExistingApplication(null);
          setLoading(false);
          return;
        }

        navigate('/signin');
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        setUserId(user.id);

        // Fetch existing application from your backend REST API
        const resp = await fetch(`/api/tutor-verification?user_id=${encodeURIComponent(user.id)}`);
        if (resp.ok) {
          const json = await resp.json();
          if (json && json.data) {
            setExistingApplication(json.data);
          }
        } else {
          console.error('Error fetching application: ', resp.statusText);
        }
      } catch (err) {
        console.error('Error parsing stored user or fetching application:', err);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmitted = () => {
    checkExistingApplication();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Apply to Become a Tutor
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Share your expertise and inspire learners worldwide
            </p>
          </div>

          {existingApplication && (existingApplication.status === 'Pending' || existingApplication.status === 'Rejected') ? (
            <ApplicationStatus application={existingApplication} />
          ) : (
            <TutorApplicationForm
              userId={userId!}
              onSuccess={handleApplicationSubmitted}
            />
          )}
        </div>
      </div>
    </div>
  );
}
