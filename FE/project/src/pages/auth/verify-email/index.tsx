import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, RefreshCw, Languages, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import axios, { AxiosError } from 'axios';

interface BeErrorResponse {
  message?: string;
}

const VerifyEmail = () => {
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [errors, setErrors] = useState<{ otp?: string }>({});
  const [message, setMessage] = useState<string>('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get('type') || 'signup';
  const email = searchParams.get('email');

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  useEffect(() => {
    if (searchParams.get('token')) {
      handleAutoVerify();
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  const handleAutoVerify = async () => {
    setIsVerifying(true);
    try {
      const token = searchParams.get('token');
      if (!token) throw new Error('No token provided');

      // API xác thực OTP cho reset password
      const response = await axios.post('http://localhost:8080/auth/verify-reset-otp', {
        email,
        otp: token
      });

      console.log('Auto verification success:', response.data);
      setIsVerified(true);

      setTimeout(() => {
        if (type === 'password-reset') {
          navigate('/auth/complete-forgot-password');
        } else {
          navigate('/signin?verified=true');
        }
      }, 3000);
    } catch (error: AxiosError<BeErrorResponse> | unknown) {
      console.error('Verification failed:', error);
      const axiosError = error as AxiosError<BeErrorResponse>;
      setErrors({ otp: axiosError.response?.data?.message || 'Verification failed' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode.trim()) {
      setErrors({ otp: 'Vui lòng nhập mã OTP' });
      return;
    }

    if (otpCode.length !== 6) {
      setErrors({ otp: 'Mã OTP phải có 6 chữ số' });
      return;
    }

    if (!email) {
      setErrors({ otp: 'Email không hợp lệ' });
      return;
    }

    setIsVerifying(true);
    setErrors({});

    try {
      // API xác thực OTP
      const response = await axios.post('http://localhost:8080/auth/verify-reset-otp', {
        email,
        otp: otpCode
      });

      console.log('Manual verification success:', response.data);
      setIsVerified(true);

      setTimeout(() => {
        navigate('/signin?verified=true');
      }, 3000);
    } catch (error: AxiosError<BeErrorResponse> | unknown) {
      console.error('Verification failed:', error);
      const axiosError = error as AxiosError<BeErrorResponse>;
      setErrors({ otp: axiosError.response?.data?.message || 'Mã OTP không chính xác' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;

    setCanResend(false);
    setCountdown(60);
    setMessage('');

    try {
      // API gửi lại OTP
      await axios.post('http://localhost:8080/auth/resend-otp', {
        email
      });
      console.log('Resend OTP success');
      setMessage('Mã OTP mới đã được gửi đến email của bạn.');
    } catch (error: AxiosError<BeErrorResponse> | unknown) {
      console.error('Resend failed:', error);
      const axiosError = error as AxiosError<BeErrorResponse>;
      setMessage(axiosError.response?.data?.message || 'Gửi lại thất bại. Vui lòng thử sau.');
    }

    // Reset countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getTitle = () => {
    if (isVerified) return 'Email đã được xác thực!';
    if (type === 'password-reset') return 'Xác thực Email để đặt lại mật khẩu';
    return 'Xác thực Email của bạn';
  };

  const getDescription = () => {
    if (isVerified) {
      if (type === 'password-reset') {
        return 'Email của bạn đã được xác thực. Quá trình đặt lại mật khẩu đã hoàn tất.';
      }
      return 'Email của bạn đã được xác thực thành công. Bạn có thể đăng nhập vào tài khoản của mình.';
    }

    if (type === 'password-reset') {
      return 'Vui lòng nhập mã OTP được gửi đến email của bạn để hoàn tất việc đặt lại mật khẩu.';
    }
    return 'Chúng tôi đã gửi mã OTP 6 chữ số đến địa chỉ email của bạn. Vui lòng nhập mã để xác thực tài khoản.';
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
                {type === 'password-reset' ? 'Hoàn tất đặt lại mật khẩu...' : 'Đang chuyển đến đăng nhập...'}
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
              <form onSubmit={handleManualVerify} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Mã OTP (6 chữ số)
                  </label>
                  <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setOtpCode(value);
                        if (errors.otp) {
                          setErrors({ ...errors, otp: '' });
                        }
                      }}
                      className="text-center text-2xl tracking-widest"
                      placeholder="000000"
                      disabled={isVerifying}
                  />
                  {errors.otp && <ErrorMessage message={errors.otp} />}
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isVerifying || otpCode.length !== 6}
                >
                  {isVerifying ? <LoadingSpinner size="sm" /> : 'Xác thực'}
                </Button>
              </form>
            </div>

            {/* Message display */}
            {message && (
                <div
                    className={`p-3 rounded-lg text-sm mt-4 ${
                        message.includes('Error') || message.includes('failed')
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
                Không nhận được mã? Kiểm tra thư mục spam.
              </p>

              <div className="flex flex-col space-y-3">
                <Button
                    onClick={handleResendEmail}
                    disabled={!canResend}
                    variant="outline"
                    className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {canResend ? 'Gửi lại mã' : `Gửi lại sau ${countdown}s`}
                </Button>

                <Button asChild variant="ghost" className="w-full">
                  <Link to="/signin">Quay lại đăng nhập</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
  );
};

export default VerifyEmail;