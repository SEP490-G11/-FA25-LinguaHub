import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { signIn } from '@/redux/slices/authSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import { clearError } from '@/redux/slices/authSlice';
import { ROUTES } from '@/constants';
const signInSchema = z.object({
  username: z.string().min(3, 'Login name must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false).optional(),
});

type SignInForm = z.infer<typeof signInSchema>;

const SignIn = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
// ⬇️ Thêm useEffect này
  React.useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });


  const onSubmit = async (data: SignInForm) => {
    await dispatch(signIn(data)).unwrap();
    navigate('/', { replace: true });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-gray-600">Sign in to continue your language learning journey</p>
          </div>

          {/* Form */}
          <motion.div
              className="bg-white rounded-2xl shadow-xl p-8"
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
          >
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && <ErrorMessage message={error} />}

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username  {/* Updated label */}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />  {/* User icon */}
                  </div>
                  <Input
                      id="username"
                      {...register('username')}
                      type="text"
                      autoComplete="username"
                      className="pl-10"
                      placeholder="Enter your username"
                      aria-invalid={errors.username ? 'true' : 'false'}
                  />
                </div>
                {errors.username && <ErrorMessage message={errors.username.message!} />}
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
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      aria-invalid={errors.password ? 'true' : 'false'}
                  />
                  <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <ErrorMessage message={errors.password.message!} />}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="rememberMe" {...register('rememberMe')} />
                  <label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot your password?
                </Link>
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
                      Signing in...
                    </>
                ) : (
                    'Sign In'
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                    to={ROUTES.SIGN_UP}
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign up now
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
  );
};

export default SignIn;