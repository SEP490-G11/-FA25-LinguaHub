import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, RefreshCw, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const VerifyEmail = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get('type') || 'signup';
  const token = searchParams.get('token');

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  useEffect(() => {
    // Auto verify if token is present
    if (token) {
      handleVerify();
    }

    // Countdown for resend button
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [token]);

  const handleVerify = async () => {
    setIsVerifying(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsVerified(true);
      
      // Redirect after successful verification
      setTimeout(() => {
        if (type === 'password-reset') {
          navigate('/auth/complete-forgot-password');
        } else {
          navigate('/signin?verified=true');
        }
      }, 3000);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    setCanResend(false);
    setCountdown(60);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getTitle = () => {
    if (isVerified) return 'Email Verified!';
    if (type === 'password-reset') return 'Verify Email for Password Reset';
    return 'Verify Your Email';
  };

  const getDescription = () => {
    if (isVerified) {
      if (type === 'password-reset') {
        return 'Your email has been verified. Your password reset is now complete.';
      }
      return 'Your email has been verified successfully. You can now sign in to your account.';
    }
    
    if (type === 'password-reset') {
      return 'Please check your email and click the verification link to complete your password reset.';
    }
    return 'We\'ve sent a verification link to your email address. Please check your email and click the link to verify your account.';
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
              {type === 'password-reset' ? 'Completing password reset...' : 'Redirecting to sign in...'}
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
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
            
            {token && !isVerifying && (
              <Button onClick={handleVerify} className="w-full mb-4">
                Verify Email
              </Button>
            )}
            
            {isVerifying && (
              <div className="mb-4">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-gray-500 mt-2">Verifying your email...</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder.
            </p>
            
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={handleResendEmail}
                disabled={!canResend}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {canResend ? 'Resend Email' : `Resend in ${countdown}s`}
              </Button>
              
              <Button asChild variant="ghost" className="w-full">
                <Link to="/signin">
                  Back to Sign In
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;