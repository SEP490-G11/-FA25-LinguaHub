import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {  CheckCircle, RefreshCw, Languages, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import axios, { AxiosError } from 'axios';

interface BeErrorResponse {
  code?: number;
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
  const email = searchParams.get('email');  // Giữ để hiển thị UI và resend

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  useEffect(() => {
    // FIXED: Lưu email vào localStorage làm fallback nếu session fail (dùng cho header nếu cần)
    if (email) {
      localStorage.setItem('temp_verify_email', decodeURIComponent(email));
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

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode.trim() || otpCode.length !== 6) {
      setErrors({ otp: otpCode.length !== 6 ? 'Mã OTP phải có 6 chữ số' : 'Vui lòng nhập mã OTP' });
      return;
    }

    setIsVerifying(true);
    setErrors({});
    const token = localStorage.getItem('accessToken');
    console.log('Token before verify:', token);

    const verifyEmail = decodeURIComponent(email || localStorage.getItem('temp_verify_email') || '');
    if (!verifyEmail) {
      setErrors({ otp: 'Email không tồn tại để verify. Hãy resend OTP.' });
      setIsVerifying(false);
      return;
    }

    try {
      const config: any = { withCredentials: true };
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      } else {
        console.warn('No token, falling back to session/cookie');
      }

      const response = await axios.post(
          'http://localhost:8080/auth/verify',
          { otp: otpCode, email: verifyEmail },  // Thêm email nếu BE cần
          config
      );

      console.log('Verification success:', response.data);
      const newToken = response.data.token;
      if (newToken) localStorage.setItem('accessToken', newToken);

      setIsVerified(true);
      localStorage.removeItem('temp_verify_email');

      setTimeout(() => {
        navigate(type === 'password-reset' ? '/auth/complete-forgot-password' : '/signin?verified=true');
      }, 3000);
    } catch (error: AxiosError<BeErrorResponse> | unknown) {
      const axiosError = error as AxiosError<BeErrorResponse>;
      console.error('Verification failed:', axiosError.response);
      const beError = axiosError.response?.data;

      if (axiosError.response?.status === 401 || beError?.code === 1006) {
        setErrors({ otp: '401/1006 error. Token/session invalid. Try resend OTP.' });
        localStorage.removeItem('accessToken');
      } else {
        setErrors({ otp: beError?.message || 'Mã OTP không chính xác' });
      }
      setCanResend(true);
      setCountdown(0);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    // FIXED: Check email trước
    if (!email) {
      setMessage('Email không được cung cấp');
      return;
    }

    setCanResend(false);
    setCountdown(60);
    setMessage('');
    setErrors({});  // Clear error khi resend

    try {
      // FIXED: Gửi { email } cho resend để backend gửi OTP mới + set session (refresh auth state)
      const response = await axios.post('http://localhost:8080/auth/resend-otp', {
        email: decodeURIComponent(email)
      }, {
        withCredentials: true  // Để set session mới
      });
      console.log('Resend OTP success:', response.data);
      setMessage('Mã OTP mới đã được gửi đến email của bạn. Session đã được cập nhật để đăng ký tài khoản.');

      // FIXED: Nếu backend trả token sau resend, set nó (giả sử response.data.token tồn tại)
      const newToken = response.data.token;
      if (newToken) {
        localStorage.setItem('accessToken', newToken);
        console.log('New token set from resend:', newToken);
      }

      // FIXED: Clear temp email vì session mới được set
      localStorage.removeItem('temp_verify_email');
    } catch (error: AxiosError<BeErrorResponse> | unknown) {
      console.error('Resend failed:', error);
      const axiosError = error as AxiosError<BeErrorResponse>;
      const beError = axiosError.response?.data;
      console.log('Full error response for resend:', axiosError.response);
      setMessage(beError?.message || 'Gửi lại thất bại (401). Kiểm tra backend: Endpoint /auth/resend-otp có yêu cầu auth không? Hoặc CORS credentials.');
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
    return 'Xác thực Email để hoàn tất đăng ký';
  };

  const getDescription = () => {
    if (isVerified) {
      if (type === 'password-reset') {
        return 'Email của bạn đã được xác thực. Quá trình đặt lại mật khẩu đã hoàn tất.';
      }
      return 'Email của bạn đã được xác thực thành công. Tài khoản với email này đã được tạo, bạn có thể đăng nhập ngay.';
    }

    if (type === 'password-reset') {
      return 'Vui lòng nhập mã OTP được gửi đến email của bạn để hoàn tất việc đặt lại mật khẩu.';
    }
    // FIXED: Hiển thị email để user confirm, nhấn mạnh đăng ký
    return `Chúng tôi đã gửi mã OTP 6 chữ số đến ${decodeURIComponent(email || '')}. Nhập mã để xác thực và hoàn tất tạo tài khoản.`;
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

            {/* FIXED: Thêm button resend nổi bật nếu 401/1006 error */}
            {errors.otp?.includes('401') || errors.otp?.includes('1006') && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">Để tiếp tục đăng ký, hãy gửi lại OTP (có thể do CORS/session):</p>
                  <Button
                      onClick={handleResendEmail}
                      variant="outline"
                      className="w-full"
                      size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Gửi lại OTP ngay
                  </Button>
                </div>
            )}

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