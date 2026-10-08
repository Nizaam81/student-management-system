import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../config/axios';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
} from 'lucide-react';

export const StudentSignup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ fullName, email, phone, password }) => {
    try {
      const { data } = await api.post('/api/users/signup', {
        name: fullName,
        email,
        phone,
        password,
      });

      toast.success(data.message || 'Account created successfully.');
      navigate('/');
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || 'Unable to create your account.',
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black">
      <div className="w-full max-w-lg">

        {/* Card Container */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">

          {/* Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white mb-3">
              <UserPlus className="w-7 h-7" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create Student Account
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
              Register for academic course access and university services
            </p>
          </div>

          {/* Form UI */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="signup-full-name" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                Full Name
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>

                <input
                  id="signup-full-name"
                  type="text"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? 'signup-full-name-error' : undefined}
                  {...register('fullName', {
                    required: 'Full name is required.',
                    validate: (value) =>
                      value.trim().length >= 2 || 'Enter at least 2 characters.',
                  })}
                  placeholder="e.g. Johnathan Doe"
                  className={`w-full pl-10 pr-4 py-2.5 bg-black border rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white transition ${
                    errors.fullName ? 'border-red-500' : 'border-zinc-800 focus:border-white'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p id="signup-full-name-error" className="text-xs text-red-400" role="alert">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="signup-email" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                  Email Address
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>

                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'signup-email-error' : undefined}
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
                  <p id="signup-email-error" className="text-xs text-red-400" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="signup-phone" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                  Phone Number
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Phone className="w-4 h-4" />
                  </div>

                  <input
                    id="signup-phone"
                    type="tel"
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'signup-phone-error' : undefined}
                    {...register('phone', {
                      required: 'Phone number is required.',
                      pattern: {
                        value: /^\+?[\d\s().-]{7,20}$/,
                        message: 'Enter a valid phone number.',
                      },
                    })}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full pl-10 pr-4 py-2.5 bg-black border rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white transition ${
                      errors.phone ? 'border-red-500' : 'border-zinc-800 focus:border-white'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p id="signup-phone-error" className="text-xs text-red-400" role="alert">
                    {errors.phone.message}
                  </p>
                )}
              </div>

            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="signup-password" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                  Password
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>

                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'signup-password-error' : undefined}
                    {...register('password', {
                      required: 'Password is required.',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters.',
                      },
                    })}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-11 py-2.5 bg-black border rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white transition ${
                      errors.password ? 'border-red-500' : 'border-zinc-800 focus:border-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-white transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="signup-password-error" className="text-xs text-red-400" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3 px-4 bg-white text-black font-semibold rounded-xl text-sm hover:bg-zinc-200 active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account & Proceed'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400">
              Already have an account?{' '}

              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-white font-medium hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};