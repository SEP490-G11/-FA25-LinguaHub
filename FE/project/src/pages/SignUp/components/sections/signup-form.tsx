import axios, { AxiosError } from 'axios';
import { useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, Languages, Calendar, UserCircle } from 'lucide-react';
import { useEffect } from 'react';


interface FormErrors {
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  password?: string;
  confirmPassword?: string;
}

interface FormData {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  password: string;
  confirmPassword: string;
}

interface BeErrorResponse {
  code?: number;
  message?: string;
}

const SignUpForm = () => {
  useEffect(() => {

    setMessage('');
    setErrors({});


    return () => {
      setMessage('');
      setErrors({});
    };
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    dob: new Date().toISOString().split('T')[0],  // Default to current date
    gender: 'Male',
    password: '',
    confirmPassword: ''

  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, '')))
      newErrors.phone = 'Phone number must be at least 10 digits';

    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    else {
      const age = (new Date().getTime() - new Date(formData.dob).getTime()) / (1000 * 3600 * 24 * 365.25);
      if (age < 13) newErrors.dob = 'You must be at least 13 years old';
    }

    if (!formData.gender) newErrors.gender = 'Gender is required';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      newErrors.password = 'Password must contain uppercase, lowercase, and number';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    if (validateForm()) {
      try {
        const response = await axios.post('http://localhost:8080/auth/register', {
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          dob: formData.dob,
          country: '',
          address: '',
          bio: ''
        }, {
          withCredentials: true  // Thêm để gửi/set cookie/session
        });
        console.log('Registration success:', response.data);

        const token = response.data.token;
        if (token) {
          localStorage.setItem('accessToken', token);
        } else {
          console.warn('No token in registration response. Verify may fallback to no-auth.');
        }


        if (response.data.code === 0 || response.data.code === 1006) {
          setMessage('Account created successfully! OTP sent. Redirecting to verification...');
          setTimeout(() => {
            navigate(`/auth/verify-email?type=signup&email=${encodeURIComponent(formData.email)}`);
          }, 1500);
        } else {
          setMessage('Registration successful! Redirecting...');
          setTimeout(() => {
            navigate('/signin');
          }, 1500);
        }


        setFormData({
          username: '',
          fullName: '',
          email: '',
          phone: '',
          dob: new Date().toISOString().split('T')[0],
          gender: 'Male',
          password: '',
          confirmPassword: ''
        });
        setErrors({});
      } catch (error: AxiosError<BeErrorResponse> | unknown) {
        console.error('Registration error:', error);
        const axiosError = error as AxiosError<BeErrorResponse>;
        const errorData = axiosError.response?.data || { message: 'Unknown error' };


        if (errorData.code === 0 || errorData.code === 1006) {
          setMessage('Account created successfully! OTP sent. Redirecting to verification...');
          setTimeout(() => {
            navigate(`/auth/verify-email?type=signup&email=${encodeURIComponent(formData.email)}`);
          }, 1500);
          return;
        }

        setMessage(`Error: ${errorData.message || 'Registration failed. Please try again.'}`);
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
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
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Hiển thị message */}
              {message && (
                  <div className={`p-3 rounded-lg text-sm ${
                      message.includes('Error') || message.includes('failed')
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {message}
                  </div>
              )}

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.username ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your username"
                  />
                </div>
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
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
                  <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.fullName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
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
                  <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
                  <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
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
                  <input
                      id="dob"
                      name="dob"
                      type="date"
                      required
                      value={formData.dob}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.dob ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                </div>
                {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
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
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.gender ? 'border-red-300' : 'border-gray-300'
                      }`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
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
                  <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Create a password"
                  />
                  <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
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
                  <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                  />
                  <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Create Account
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500">
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