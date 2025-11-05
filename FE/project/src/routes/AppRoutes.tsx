import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.ts';

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
import CreateCourse from '@/pages/CreateCourse/index';
import PendingCourses from '@/pages/PendingCourses/index';
import TutorCourses from '@/pages/TutorCourses/index';
import MyCourses from '@/pages/MyCourses/index';
import PaymentHistory from "@/pages/PaymentHistory";
import MyEnrollments from "@/pages/MyEnrollments";
import ApplyTutor from '@/pages/ApplyTutor/index';
import Profile from '@/pages/Profile/Profile.tsx';
import ChangePassword from '@/pages/ChangePassword/index';
import VerifyEmailForgotPassword from '@/pages/auth/verify-email-forgot-password/verify-email-forgot-password.tsx';

export function AppRoutes() {
    return (
        <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.SIGN_IN} element={<SignIn />} />
            <Route path={ROUTES.COMPLETE_FORGOT_PASSWORD } element={<CompleteForgotPassword />} />
            <Route path={ROUTES.GOOGLE_CALLBACK } element={<GoogleCallback />} />
            <Route path={ROUTES.FORGOT_PASSWORD } element={<ForgotPassword />} />
            <Route path={ROUTES.RESET_PASSWORD } element={<ResetPassword />} />
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
            <Route path={ROUTES.SIGN_UP} element={<SignUp />} />
            <Route path={ROUTES.CREATE_COURSE} element={<CreateCourse />} />
            <Route path={ROUTES.PENDING_COURSES} element={<PendingCourses />} />
            <Route path={ROUTES.TUTOR_COURSES } element={<TutorCourses />} />
            <Route path={ROUTES.MY_COURSES } element={<MyCourses />} />
            <Route path={ROUTES.LANGUAGES} element={<Languages />} />
            <Route path={ROUTES.TUTORS} element={<Tutors />} />
            <Route path={ROUTES.TUTOR_DETAIL} element={<TutorDetail />} />
            <Route path={ROUTES.COURSE_DETAIL} element={<CourseDetail />} />
            <Route path={ROUTES.LESSON_DETAIL} element={<LessonDetail />} />
            <Route path={ROUTES.PRACTICE_TEST} element={<PracticeTest />} />
            <Route path={ROUTES.BECOME_TUTOR} element={<BecomeTutor />} />
            <Route path={ROUTES.WISHLIST} element={<Wishlist />} />
            <Route path={ROUTES.PAYMENT} element={<Payment />} />
            <Route path={ROUTES.POLICY} element={<PolicyPage />} />
            <Route path={ROUTES.LANGUAGE_COURSES} element={<LanguageCourses />} />
            <Route path="*" element={<NotFound />} />
            <Route path={ROUTES.PAYMENT_HISTORY } element={<PaymentHistory />} />
            <Route path={ROUTES.MY_ENROLLMENTS} element={<MyEnrollments />} />
            <Route path={ROUTES.APPLY_TUTOR} element={<ApplyTutor />} />
                <Route path={ROUTES.PROFILE} element={<Profile />} />
                <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePassword />} />
                <Route path={ROUTES.VERIFY_EMAIL_FORGOT_PASSWORD} element={<VerifyEmailForgotPassword />} />
        </Routes>
    );
}