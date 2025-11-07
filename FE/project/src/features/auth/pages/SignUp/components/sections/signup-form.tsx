import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, Languages, Calendar, UserCircle } from 'lucide-react';
import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/app/store/store.ts';
import { clearError, signUp } from '@/app/store/slices/authSlice.ts';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button.tsx';
import { ErrorMessage } from '@/shared/components/shared/ErrorMessage.tsx';
import { LoadingSpinner } from '@/shared/components/shared/LoadingSpinner.tsx';
import { ROUTES } from '@/shared/constants/routes.ts';

const signUpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Email is invalid'),
  phone: z.string()
      .min(1, 'Phone number is required')
      .refine((val) => /^\d{10,}$/.test(val.replace(/\D/g, '')), {
        message: 'Phone number must be at least 10 digits',
      }),
  dob: z.string()
      .min(1, 'Date of birth is required')
      .refine((val) => {
        const age = (new Date().getTime() - new Date(val).getTime()) / (1000 * 3600 * 24 * 365.25);
        return age >= 13;
      }, { message: 'You must be at least 13 years old' }),
  gender: z.enum(['Male', 'Female', 'Other'], { message: 'Gender is required' }),
  password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error: authError, user } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      phone: '',
      dob: '',
      gender: 'Male',
      password: '',
      confirmPassword: '',
    },
  });

  const { register, handleSubmit, formState: { errors, isValid }, reset } = form;

  // Destructuring register props cho từng field để chain onChange dễ dàng hơn
  const usernameRegister = register('username');
  const fullNameRegister = register('fullName');
  const emailRegister = register('email');
  const phoneRegister = register('phone');
  const dobRegister = register('dob');
  const genderRegister = register('gender');
  const passwordRegister = register('password');
  const confirmPasswordRegister = register('confirmPassword');

  const handleChangeInput = () => {
    if (authError) {
      dispatch(clearError());
    }
  };

  useEffect(() => {
    if (user) {
      // Reset form after successful signup
      reset({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        gender: 'Male',
        password: '',
        confirmPassword: '',
      });
      // Optionally navigate here if not already handled in onSubmit
    }
    // Removed the auto-clear of authError here to allow it to display
  }, [user, reset]); // Removed authError, navigate, dispatch, getValues from deps

  const onSubmit = async (data: SignUpFormData) => {
    dispatch(clearError()); // Clear any stale errors before submitting
    try {
      const userData = {
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        dob: data.dob,
        country: '',
        address: '',
        bio: '',
      };
      await dispatch(signUp(userData)).unwrap();
      navigate(ROUTES.VERIFY_EMAIL);
    } catch (error: unknown) {
      // Log chi tiết error để debug (kiểm tra console để xem BE trả gì)
      console.error('Signup error:', error);
      // Nếu error là timeout, có thể dispatch một error custom nếu cần, nhưng để Redux handle
      if (error instanceof Error && error.message.includes('timeout')) {
        // Optional: dispatch một action set error custom, ví dụ: dispatch(setError('Request timed out. Please try again.'));
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  // Helper để extract message từ authError (fix "Unknown error")
  const getErrorMessage = (err: unknown): string => {
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object') {
      if ('message' in err && typeof (err as Record<string, unknown>).message === 'string') {
        return (err as { message: string }).message;
      }
      if ('error' in err && typeof (err as Record<string, unknown>).error === 'string') {
        return (err as { error: string }).error;
      }
      if ('detail' in err && typeof (err as Record<string, unknown>).detail === 'string') {
        return (err as { detail: string }).detail;
      }
      return 'Unknown error';
    }
    return 'Unknown error';
  };

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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Start your language learning journey today</p>
          </div>

          {/* Form */}
          <motion.div
              className="bg-white rounded-2xl shadow-xl p-8"
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
          >
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {authError && <ErrorMessage message={getErrorMessage(authError)} />} {/* Sử dụng helper để extract message đúng */}

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                      id="username"
                      {...usernameRegister}
                      onChange={(e) => {
                        handleChangeInput();
                        usernameRegister.onChange(e); // Chain với onChange gốc
                      }}
                      type="text"
                      autoComplete="username"
                      className="pl-10"
                      placeholder="Enter your username"
                      aria-invalid={errors.username ? 'true' : 'false'}
                      disabled={isLoading}
                  />
                </div>
                {errors.username && <ErrorMessage message={errors.username.message!} />}
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                      id="fullName"
                      {...fullNameRegister}
                      onChange={(e) => {
                        handleChangeInput();
                        fullNameRegister.onChange(e);
                      }}
                      type="text"
                      autoComplete="name"
                      className="pl-10"
                      placeholder="Enter your full name"
                      aria-invalid={errors.fullName ? 'true' : 'false'}
                      disabled={isLoading}
                  />
                </div>
                {errors.fullName && <ErrorMessage message={errors.fullName.message!} />}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                      id="email"
                      {...emailRegister}
                      onChange={(e) => {
                        handleChangeInput();
                        emailRegister.onChange(e);
                      }}
                      type="email"
                      autoComplete="email"
                      className="pl-10"
                      placeholder="Enter your email"
                      aria-invalid={errors.email ? 'true' : 'false'}
                      disabled={isLoading}
                  />
                </div>
                {errors.email && <ErrorMessage message={errors.email.message!} />}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                      id="phone"
                      {...phoneRegister}
                      onChange={(e) => {
                        handleChangeInput();
                        phoneRegister.onChange(e);
                      }}
                      type="tel"
                      autoComplete="tel"
                      className="pl-10"
                      placeholder="Enter your phone number"
                      aria-invalid={errors.phone ? 'true' : 'false'}
                      disabled={isLoading}
                  />
                </div>
                {errors.phone && <ErrorMessage message={errors.phone.message!} />}
              </div>

              {/* DOB */}
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                      id="dob"
                      {...dobRegister}
                      onChange={(e) => {
                        handleChangeInput();
                        dobRegister.onChange(e);
                      }}
                      type="date"
                      className="pl-10"
                      max={new Date().toISOString().split('T')[0]}
                      aria-invalid={errors.dob ? 'true' : 'false'}
                      disabled={isLoading}
                  />
                </div>
                {errors.dob && <ErrorMessage message={errors.dob.message!} />}
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                      id="gender"
                      {...genderRegister}
                      onChange={(e) => {
                        handleChangeInput();
                        genderRegister.onChange(e);
                      }}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.gender ? 'border-red-300' : 'border-gray-300'
                      }`}
                      aria-invalid={errors.gender ? 'true' : 'false'}
                      disabled={isLoading}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {errors.gender && <ErrorMessage message={errors.gender.message!} />}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                      id="password"
                      {...passwordRegister}
                      onChange={(e) => {
                        handleChangeInput();
                        passwordRegister.onChange(e);
                      }}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="pl-10 pr-10"
                      placeholder="Create a password"
                      aria-invalid={errors.password ? 'true' : 'false'}
                      disabled={isLoading}
                  />
                  <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <ErrorMessage message={errors.password.message!} />}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                      id="confirmPassword"
                      {...confirmPasswordRegister}
                      onChange={(e) => {
                        handleChangeInput();
                        confirmPasswordRegister.onChange(e);
                      }}
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="pl-10 pr-10"
                      placeholder="Confirm your password"
                      aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                      disabled={isLoading}
                  />
                  <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <ErrorMessage message={errors.confirmPassword.message!} />}
              </div>

              {/* Submit Button */}
              <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !isValid}
                  aria-busy={isLoading}
              >
                {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating Account...
                    </>
                ) : (
                    'Create Account'
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to={ROUTES.SIGN_IN} className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Terms */}
          <motion.div
              className="text-center text-xs text-gray-500"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
          >
            <p>
              By creating an account, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
            </p>
          </motion.div>
        </motion.div>
      </div>
  );
};

export default SignUpForm;
