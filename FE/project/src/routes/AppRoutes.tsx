import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.ts';
import { ProtectedRoute } from '@/auth';

// Pages
import HomePage from '@/pages/HomePage/homepage.tsx';
import SignIn from '@/pages/auth/signin/signin.tsx';
import SignUp from '@/pages/SignUp/signup.tsx';
import Languages from '@/pages/Languages/index';
import Tutors from '@/pages/Tutors/index';
import TutorDetail from '@/pages/TutorDetail/index';
import CourseDetail from '@/pages/CourseDetail/index';
import LessonDetail from '@/pages/LessonDetail/index';
import PracticeTest from '@/pages/PracticeTest/index';
import BecomeTutor from '@/pages/BecomeTutor/index';
import Wishlist from '@/pages/Wishlist/index';
import Payment from '@/pages/Payment/index';
import NotFound from '@/pages/not-found';
import PolicyPage from '@/pages/PolicyPage/index';
import CompleteForgotPassword from '@/pages/auth/complete-forgot-password/complete-forgot-password.tsx';
import GoogleCallback from '@/pages/auth/login-google/login-google.tsx';
import LanguageCourses from '@/pages/LanguageCourses/index';
import ForgotPassword from '@/pages/auth/forgot-password/forgot-password.tsx';
import ResetPassword from '@/pages/auth/reset-password/reset-password.tsx';
import VerifyEmail from '@/pages/auth/verify-email/veryfy-email.tsx';
import PaymentHistory from "@/pages/PaymentHistory";
import MyEnrollments from "@/pages/MyEnrollments";
import Profile from '@/pages/Profile/Profile.tsx';
import ChangePassword from '@/pages/ChangePassword/index';
import VerifyEmailForgotPassword from '@/pages/auth/verify-email-forgot-password/verify-email-forgot-password.tsx';
import CreateCourse from '@/pages/CreateCourse/index';
import CourseApprovalPage from '@/pages/Admin/CourseApproval/index';
import ApplyTutor from '@/pages/ApplyTutor';
import TutorApproval from '@/pages/Admin/TutorApproval';
import ManageCourseContent from '@/pages/TutorPages/ManageCourseContent';
import CourseList from '@/pages/TutorPages/CourseList';

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

            {/* User - Cần login */}
            <Route path={ROUTES.PROFILE} element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path={ROUTES.CHANGE_PASSWORD} element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path={ROUTES.PAYMENT_HISTORY} element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
            <Route path={ROUTES.MY_ENROLLMENTS} element={<ProtectedRoute><MyEnrollments /></ProtectedRoute>} />
            <Route path={ROUTES.APPLY_TUTOR} element={<ProtectedRoute><ApplyTutor /></ProtectedRoute>} />

            {/* Admin only */}
            <Route path="/admin/course-approval" element={<ProtectedRoute allowedRoles={['Admin']}><CourseApprovalPage /></ProtectedRoute>} />
            <Route path="/admin/tutor-approval" element={<ProtectedRoute allowedRoles={['Admin']}><TutorApproval /></ProtectedRoute>} />
            
            {/* Tutor only */}
            <Route path="/tutor/courses" element={<ProtectedRoute allowedRoles={['Tutor']}><CourseList /></ProtectedRoute>} />
            <Route path="/tutor/courses/:id/content" element={<ProtectedRoute allowedRoles={['Tutor']}><ManageCourseContent /></ProtectedRoute>} />
            <Route path="/tutor/create-courses" element={<ProtectedRoute allowedRoles={['Admin', 'Tutor']}><CreateCourse /></ProtectedRoute>} />

            {/* Not found */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}



