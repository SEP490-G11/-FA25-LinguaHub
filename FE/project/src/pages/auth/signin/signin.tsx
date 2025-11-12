import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { ErrorMessage } from '@/components/shared/ErrorMessage.tsx';
import api from "@/config/axiosConfig.ts";
import { ROUTES } from '@/constants/routes.ts';

//  Schema validate
const signInSchema = z.object({
  username: z.string().min(3, 'Login name must be at least 3 characters'),
  password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  rememberMe: z.boolean().optional(),
});

type SignInForm = z.infer<typeof signInSchema>;

const SignIn = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } =
      useForm<SignInForm>({
        resolver: zodResolver(signInSchema),
        mode: 'onChange',
        defaultValues: {
          username: '',
          password: '',
          rememberMe: false,
        },
      });

  const onSubmit = async (data: SignInForm) => {
    setApiError(null);
    try {
      const response = await api.post("/auth/token", {
        username: data.username,
        password: data.password,
      });

      const token = response.data.result.accessToken;

      //  Remember me FE logic
      if (data.rememberMe) {
        localStorage.setItem("access_token", token);
      } else {
        sessionStorage.setItem("access_token", token);
      }

      navigate(ROUTES.HOME, { replace: true });

    } catch (err) {
      console.error(" Login error:", err);
      setApiError("Username or password is incorrect.");
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
            className="max-w-md w-full space-y-8"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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
          <motion.div className="bg-white rounded-2xl shadow-xl p-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

              {apiError && <ErrorMessage message={apiError} />}

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <Input {...register("username")} className="pl-10" placeholder="Enter your username" />
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
                {errors.username && <ErrorMessage message={errors.username.message!} />}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                  />
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />

                  <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
                {errors.password && <ErrorMessage message={errors.password.message!} />}
              </div>

              {/*  Remember Me + Forgot Password on SAME ROW */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm text-gray-700">
                  <Checkbox
                      checked={watch("rememberMe")}
                      onCheckedChange={(value) => setValue("rememberMe", value as boolean)}
                  />
                  <span>Remember me</span>
                </label>


                <Link to={ROUTES.FORGOT_PASSWORD}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={!isValid}>
                Sign In
              </Button>
            </form>

            {/* Sign up link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to={ROUTES.SIGN_UP} className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
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
