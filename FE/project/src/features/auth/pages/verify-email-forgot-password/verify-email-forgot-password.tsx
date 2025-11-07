import  { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle,  Languages, Shield } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { LoadingSpinner } from '@/shared/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/shared/components/shared/ErrorMessage';
import { z } from 'zod';
import { ROUTES } from '@/shared/constants/routes.ts';
import { verifyResetOtp} from '@/app/store/slices/authSlice.ts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type {  AppDispatch } from '@/app/store/store.ts';
import { useDispatch } from 'react-redux';

const verifyEmailSchema = z.object({
  otpCode: z.string().length(6, 'OTP code must be 6 digits'),
});
type verifyEmailForm = z.infer<typeof verifyEmailSchema>;

const VerifyEmail = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  // const [canResend, setCanResend] = useState(false);
  // const [countdown, setCountdown] = useState(60);
  const [message] = useState<string>('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { register, handleSubmit, formState: { errors: formErrors } } = useForm<verifyEmailForm>({
    resolver: zodResolver(verifyEmailSchema),
  });

  const email = searchParams.get('email');

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  useEffect(() => {
    if (email) {
      localStorage.setItem('temp_verify_email', decodeURIComponent(email));
    }

    // const timer = setInterval(() => {
    //   setCountdown(prev => {
    //     if (prev <= 1) {
    //       setCanResend(true);
    //       return 0;
    //     }
    //     return prev - 1;
    //   });
    // }, 1000);

    // return () => clearInterval(timer);
  }, [searchParams]);

  const handleManualVerify = async (data: verifyEmailForm) => {
    const { otpCode } = data;
    setIsVerifying(true);
    try {
      const result = await dispatch(verifyResetOtp(otpCode)).unwrap();
      console.log('Verification success:', result);

      setIsVerified(true);
      localStorage.removeItem('temp_verify_email');

      setTimeout(() => {
        navigate(ROUTES.RESET_PASSWORD, { state: { verified: true } });
      }, 3000);
    } catch (error: unknown) {
      console.error('Verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // const handleResendEmail = async () => {
  //   const verifyEmail = decodeURIComponent(email || localStorage.getItem('temp_verify_email') || '');
  //   if (!verifyEmail) {
  //     setMessage('Email not provided');
  //     return;
  //   }

  //   setCanResend(false);
  //   setCountdown(60);
  //   setMessage('');

  //   try {
  //     const response = await BaseRequest.Post('/auth/resend-otp', { email: verifyEmail });
  //     console.log('Resend OTP success:', response);
  //     setMessage('A new OTP code has been sent to your email. Session has been updated for account registration.');

  //     const newToken = response.token;
  //     if (newToken) {
  //       localStorage.setItem('accessToken', newToken);
  //       console.log('New token set from resend:', newToken);
  //     }

  //     localStorage.removeItem('temp_verify_email');
  //   } catch (error: unknown) {
  //     console.error('Resend failed:', error);
  //     const errorMessage = (error as { message?: string })?.message || 'Resend failed (401). Check backend: Does /auth/resend-otp endpoint require auth? Or CORS credentials.';
  //     setMessage(errorMessage);
  //   }

  //   const timer = setInterval(() => {
  //     setCountdown(prev => {
  //       if (prev <= 1) {
  //         setCanResend(true);
  //         return 0;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);
  // };

  const getTitle = () => {
    if (isVerified) return 'Email Verified!';
    return 'Verify Email to Complete Registration';
  };

  const getDescription = () => {
    if (isVerified) {
      return 'Your email has been successfully verified. An account with this email has been created, you can log in now.';
    }
    const displayEmail = decodeURIComponent(email || localStorage.getItem('temp_verify_email') || 'your email');
    return `We have sent a 6-digit OTP code to ${displayEmail}. Enter the code to verify and complete account creation.`;
  };

  if (isVerified) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
              className="max-w-md w-full space-y-8"
              initial="initial"
              animate="animate"
              variants={fadeInUp}
          >
            {/* Header */}
            <div className="text-center">
              <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
                  <Languages className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-800">
                  Lingua<span className="text-blue-500">Hub</span>
                </div>
              </Link>
            </div>

            {/* Success Message */}
            <motion.div
                className="bg-white rounded-2xl shadow-xl p-8 text-center"
                variants={fadeInUp}
                transition={{ delay: 0.1 }}
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{getTitle()}</h2>
                <p className="text-gray-600">{getDescription()}</p>
              </div>

              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">
                Redirecting to login...
              </p>
            </motion.div>
          </motion.div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
            className="max-w-md w-full space-y-8"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
        >
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
                <Languages className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                Lingua<span className="text-blue-500">Hub</span>
              </div>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{getTitle()}</h2>
            <p className="text-gray-600">{getDescription()}</p>
          </div>

          {/* Verification Card */}
          <motion.div
              className="bg-white rounded-2xl shadow-xl p-8"
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>

              {/* OTP Form */}
              <form onSubmit={handleSubmit(handleManualVerify)} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    OTP Code (6 digits)
                  </label>
                  <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      {...register('otpCode', { setValueAs: (v) => v.replace(/\D/g, '') })}
                      className="text-center text-2xl tracking-widest"
                      placeholder="000000"
                      disabled={isVerifying}
                  />
                  {formErrors.otpCode && (
                      <ErrorMessage message={formErrors.otpCode.message ?? ''} />
                  )}
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isVerifying}
                >
                  {isVerifying ? <LoadingSpinner size="sm" /> : 'Verify'}
                </Button>
              </form>
            </div>

            {/* FIXED: Thêm button resend nổi bật nếu 401/1006 error */}
            {/* {formErrors.otpCode?.message?.includes('401') || formErrors.otpCode?.message?.includes('1006') && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">To continue registration, please resend OTP (possibly due to CORS/session):</p>
                  <Button
                      onClick={handleResendEmail}
                      variant="outline"
                      className="w-full"
                      size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend OTP Now
                  </Button>
                </div>
            )} */}

            {/* Message display */}
            {message && (
                <div
                    className={`p-3 rounded-lg text-sm mt-4 ${
                        message.includes('Error') || message.includes('failed') || message.includes('401')
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-green-50 text-green-700 border border-green-200'
                    }`}
                >
                  {message}
                </div>
            )}

            {/* Resend code button */}
            <div className="space-y-4">
              <p className="text-sm text-gray-500 text-center">
                Didn't receive the code? Check your spam folder.
              </p>

              <div className="flex flex-col space-y-3">
                {/* <Button
                    onClick={handleResendEmail}
                    disabled={!canResend}
                    variant="outline"
                    className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
                </Button> */}

                <Button asChild variant="ghost" className="w-full">
                  <Link to={ROUTES.SIGN_IN}>Back to Login</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
  );
};

export default VerifyEmail;
