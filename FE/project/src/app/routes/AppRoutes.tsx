import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes.ts';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import HomePage from '@/features/learner/pages/HomePage/homepage.tsx';
import SignIn from '@/features/auth/pages/signin/signin.tsx';
import SignUp from '@/features/auth/pages/SignUp/signup.tsx';
import Languages from '@/features/learner/pages/Languages/index';
import Tutors from '@/features/learner/pages/Tutors/index';
import TutorDetail from '@/features/learner/pages/TutorDetail/index';
import CourseDetail from '@/features/learner/pages/CourseDetail/index';
import LessonDetail from '@/features/learner/pages/LessonDetail/index';
import PracticeTest from '@/features/learner/pages/PracticeTest/index';
import BecomeTutor from '@/features/learner/pages/BecomeTutor/index';
import Wishlist from '@/features/learner/pages/Wishlist/index';
import Payment from '@/features/learner/pages/Payment/index';
import NotFound from '@/features/learner/pages/not-found';
import PolicyPage from '@/features/learner/pages/PolicyPage/index';
import CompleteForgotPassword from '@/features/auth/pages/complete-forgot-password/complete-forgot-password.tsx';
import GoogleCallback from '@/features/auth/pages/login-google/login-google.tsx';
import LanguageCourses from '@/features/learner/pages/LanguageCourses/index';
import ForgotPassword from '@/features/auth/pages/forgot-password/forgot-password.tsx';
import ResetPassword from '@/features/auth/pages/reset-password/reset-password.tsx';
import VerifyEmail from '@/features/auth/pages/verify-email/veryfy-email.tsx';
import PaymentHistory from "@/features/learner/pages/PaymentHistory";
import MyEnrollments from "@/features/learner/pages/MyEnrollments";
import Profile from '@/features/learner/pages/Profile/Profile.tsx';
import ChangePassword from '@/features/learner/pages/ChangePassword/index';
import VerifyEmailForgotPassword from '@/features/auth/pages/verify-email-forgot-password/verify-email-forgot-password.tsx';
import CreateCourse from '@/features/learner/pages/CreateCourse/index';
import CourseApprovalPage from '@/features/admin/pages/Admin/CourseApproval/index';
import ApplyTutor from '@/features/learner/pages/ApplyTutor';
import TutorApproval from '@/features/admin/pages/Admin/TutorApproval';
import ManageCourseContent from '@/features/tutor/pages/TutorPages/ManageCourseContent';
import CourseList from '@/features/tutor/pages/TutorPages/CourseList';
import TutorDashboardLayout from '@/layouts/TutorDashboardLayout';
import TutorDashboard from '@/features/tutor/pages/TutorPages/Dashboard';
import TutorStudents from '@/features/tutor/pages/TutorPages/Students';
import TutorSchedule from '@/features/tutor/pages/TutorPages/Schedule';
import TutorAnalytics from '@/features/tutor/pages/TutorPages/Analytics';
import TutorMessages from '@/features/tutor/pages/TutorPages/Messages';
import TutorResources from '@/features/tutor/pages/TutorPages/Resources';
import TutorSettings from '@/features/tutor/pages/TutorPages/Settings';

export function AppRoutes() {
    return (
        <Routes>
            {/* Auth */}
            <Route path={ROUTES.SIGN_IN} element={<SignIn />} />
            <Route path={ROUTES.SIGN_UP} element={<SignUp />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
            <Route path={ROUTES.VERIFY_EMAIL_FORGOT_PASSWORD} element={<VerifyEmailForgotPassword />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
            <Route path={ROUTES.COMPLETE_FORGOT_PASSWORD} element={<CompleteForgotPassword />} />
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
            <Route path={ROUTES.GOOGLE_CALLBACK} element={<GoogleCallback />} />

            {/* Main pages */}
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.LANGUAGES} element={<Languages />} />
            <Route path={ROUTES.TUTORS} element={<Tutors />} />
            <Route path={ROUTES.TUTOR_DETAIL} element={<TutorDetail />} />
            <Route path={ROUTES.COURSE_DETAIL} element={<CourseDetail />} />
            <Route path={ROUTES.LESSON_DETAIL} element={<LessonDetail />} />
            <Route path={ROUTES.LANGUAGE_COURSES} element={<LanguageCourses />} />
            <Route path={ROUTES.PRACTICE_TEST} element={<PracticeTest />} />
            <Route path={ROUTES.BECOME_TUTOR} element={<BecomeTutor />} />
            <Route path={ROUTES.WISHLIST} element={<Wishlist />} />
            <Route path={ROUTES.PAYMENT} element={<Payment />} />
            <Route path={ROUTES.POLICY} element={<PolicyPage />} />

            {/* User */}
            <Route path={ROUTES.PROFILE} element={<Profile />} />
            <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePassword />} />
            <Route path={ROUTES.PAYMENT_HISTORY} element={<PaymentHistory />} />
            <Route path={ROUTES.MY_ENROLLMENTS} element={<MyEnrollments />} />
            <Route path={ROUTES.APPLY_TUTOR} element={<ApplyTutor />} />

            {/* Admin & Tutor */}
            <Route path="/admin/course-approval" element={<CourseApprovalPage />} />
            <Route path="/admin/tutor-approval" element={<TutorApproval />} />
            
            {/* Tutor Dashboard with Layout - Protected by Role */}
            <Route path="/tutor" element={
              <ProtectedRoute requiredRole="Tutor">
                <TutorDashboardLayout />
              </ProtectedRoute>
            }>
                <Route path="dashboard" element={<TutorDashboard />} />
                <Route path="courses" element={<CourseList />} />
                <Route path="courses/:id/content" element={<ManageCourseContent />} />
                <Route path="create-courses" element={<CreateCourse />} />
                <Route path="students" element={<TutorStudents />} />
                <Route path="schedule" element={<TutorSchedule />} />
                <Route path="analytics" element={<TutorAnalytics />} />
                <Route path="messages" element={<TutorMessages />} />
                <Route path="resources" element={<TutorResources />} />
                <Route path="settings" element={<TutorSettings />} />
            </Route>

            {/* Not found */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}



