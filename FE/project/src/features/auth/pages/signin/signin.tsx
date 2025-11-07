import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Languages } from 'lucide-react';
import { Button } from '@/shared/components/ui/button.tsx';
import { Input } from '@/shared/components/ui/input.tsx';
import { Checkbox } from '@/shared/components/ui/checkbox.tsx';
import { LoadingSpinner } from '@/shared/components/shared/LoadingSpinner.tsx';
import { ErrorMessage } from '@/shared/components/shared/ErrorMessage.tsx';
import type { RootState, AppDispatch } from '@/app/store/store.ts';
import { clearError, signIn } from '@/app/store/slices/authSlice.ts';
import { ROUTES } from '@/shared/constants/routes.ts';

// Xác thực dữ liệu form
const signInSchema = z.object({
  username: z.string().min(3, 'Login name must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false).optional(),
});

type SignInForm = z.infer<typeof signInSchema>;

//setup component SignIn
const SignIn = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error: authError } = useSelector((state: RootState) => state.auth);

  //Hook khởi tạo form với type SignInForm
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    //validate ngay khi người dùng nhập
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  // Destructuring register props cho từng field để chain onChange dễ dàng hơn
  const usernameRegister = register('username');
  const passwordRegister = register('password');
  const rememberMeRegister = register('rememberMe');

  const handleChangeInput = () => {
    if (authError) {
      dispatch(clearError());
    }
  };

  React.useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data: SignInForm) => {
    dispatch(clearError());
    try {
      const result = await dispatch(signIn(data)).unwrap();
      // Kiểm tra role và redirect tương ứng
      if (result.user && result.user.role === 'Tutor') {
        navigate(ROUTES.TUTOR_DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.HOME, { replace: true });
      }
    } catch (error: unknown) {
      console.error('Signin error:', error);
      if (error instanceof Error && error.message.includes('timeout')) {
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
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
              {authError && <ErrorMessage message={getErrorMessage(authError)} />}

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username {/* Updated label */}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" /> {/* User icon */}
                  </div>
                  {/*input field*/}
                  <Input
                      id="username"
                      {...usernameRegister}
                      onChange={(e) => {
                        handleChangeInput();
                        usernameRegister.onChange(e);
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
                      autoComplete="current-password"
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                      id="rememberMe"
                      {...rememberMeRegister}
                      onChange={(e) => {
                        handleChangeInput();
                        // Note: Checkbox onChange is boolean, but register handles it
                        rememberMeRegister.onChange(e);
                      }}
                  />
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
                <Link to={ROUTES.SIGN_UP} className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
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
