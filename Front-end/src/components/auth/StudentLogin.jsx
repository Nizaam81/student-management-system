import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

import api from '../../config/axios';
import { clearTokens, setTokens } from '../../config/jwt';
import { clearCurrentUser, setCurrentUser } from '../../store/studentSlice';

export const StudentLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    try {
      const { data } = await api.post('/api/users/login', { email, password });
      const tokens = data.tokens;

      if (!tokens?.accessToken || !tokens?.refreshToken) {
        throw new Error('The login response did not include both authentication tokens.');
      }

      setTokens(tokens.accessToken, tokens.refreshToken);
      const { data: profileData } = await api.get('/api/users/me', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      if (!profileData.user) {
        throw new Error('The profile response did not include user data.');
      }

      dispatch(setCurrentUser(profileData.user));
      toast.success(data.message || 'Login successful.');
      navigate('/student-home', { replace: true });
    } catch (error) {
      clearTokens();
      dispatch(clearCurrentUser());
      toast.error(
        error.response?.data?.message || error.message || 'Unable to log in.',
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black">
      <div className="w-full max-w-md">

        {/* Card Container */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">

          {/* Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white mb-3">
              <GraduationCap className="w-7 h-7" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              Student Login
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
              Enter your academic credentials to access your portal
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="student-email" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                Email Address
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>

                <input
                  id="student-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'student-email-error' : undefined}
                  {...register('email', {
                    required: 'Email address is required.',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address.',
                    },
                  })}
                  placeholder="student@university.edu"
                  className={`w-full pl-10 pr-4 py-2.5 bg-black border rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white transition ${
                    errors.email ? 'border-red-500' : 'border-zinc-800 focus:border-white'
                  }`}
                />
              </div>
              {errors.email && (
                <p id="student-email-error" className="text-xs text-red-400" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">

              <label htmlFor="student-password" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                Password
              </label>

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>

                <input
                  id="student-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'student-password-error' : undefined}
                  {...register('password', {
                    required: 'Password is required.',
                  })}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-11 py-2.5 bg-black border rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white transition ${
                    errors.password ? 'border-red-500' : 'border-zinc-800 focus:border-white'
                  }`}
                />

                {/* Show / Hide Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-white transition cursor-pointer"
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

              </div>
              {errors.password && (
                <p id="student-password-error" className="text-xs text-red-400" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-white text-black font-semibold rounded-xl text-sm hover:bg-zinc-200 active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>{isSubmitting ? 'Signing In...' : 'Sign In as Student'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80 text-center space-y-3">

            {/* Signup */}
            <p className="text-xs text-zinc-400">
              Don't have an account yet?{' '}

              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-white font-medium hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>

            {/* Admin Login */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/admin-login')}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition py-1 px-2.5 rounded-lg border border-zinc-900 hover:border-zinc-800 bg-zinc-950 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Portal Login</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};