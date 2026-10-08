import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import api from '../../config/axios';
import { setTokens } from '../../config/jwt';
import {
  Shield,
  Lock,
  ArrowRight,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    try {
      const { data } = await api.post('/api/admin/login', { email, password });
      if (!data.tokens?.accessToken || !data.tokens?.refreshToken) {
        throw new Error('The login response did not include both authentication tokens.');
      }

      setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      toast.success(data.message || 'Admin login successful.');
      navigate('/admin-dashboard', { replace: true });
    } catch (error) {
      const responseData = error.response?.data;
      const fieldErrors = responseData?.errors;
      const unmappedMessages = [];
      let hasMappedErrors = false;

      if (fieldErrors && typeof fieldErrors === 'object') {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          if ((field === 'email' || field === 'password') && typeof message === 'string') {
            setError(field, { type: 'server', message });
            hasMappedErrors = true;
          } else if (typeof message === 'string') {
            unmappedMessages.push(message);
          }
        });
      }

      if (unmappedMessages.length > 0) {
        toast.error(unmappedMessages.join('. '));
      } else if (!hasMappedErrors || responseData?.message !== 'Validation failed') {
        toast.error(
          responseData?.message || error.message || 'Unable to log in as admin.',
        );
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black">
      <div className="w-full max-w-md">

        {/* Card Container */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">

          {/* Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white" />

          {/* Header */}
          <div className="text-center mb-7">

            <div className="inline-flex p-3 rounded-xl bg-white text-black mb-3 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              <Shield className="w-7 h-7" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-[10px] font-mono tracking-widest text-zinc-300 uppercase mb-2">
              Privileged Access
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              Admin Console
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Authorized administrators &amp; registrar officers only
            </p>

          </div>

          {/* Form UI */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Email */}
            <div className="space-y-1.5">

              <label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                Email Address
              </label>

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>

                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'admin-email-error' : undefined}
                  {...register('email', {
                    required: 'Email address is required.',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address.',
                    },
                  })}
                  placeholder="admin@university.edu"
                  className={`w-full pl-10 pr-4 py-2.5 bg-black border rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white transition ${
                    errors.email ? 'border-red-500' : 'border-zinc-800 focus:border-white'
                  }`}
                />

              </div>
              {errors.email && (
                <p id="admin-email-error" className="text-xs text-red-400" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">

              <div className="flex items-center justify-between">

                <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                  Password
                </label>

                <span className="text-[11px] font-mono text-zinc-500">
                  Encrypted
                </span>

              </div>

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>

                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'admin-password-error' : undefined}
                  {...register('password', {
                    required: 'Password is required.',
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
                <p id="admin-password-error" className="text-xs text-red-400" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Security Token */}
            <div className="space-y-1.5">

             

              
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3 px-4 bg-white text-black font-semibold rounded-xl text-sm hover:bg-zinc-200 active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Signing In...' : 'Sign In to Admin Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80 text-center">

            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs text-zinc-400 hover:text-white transition cursor-pointer"
            >
              ← Return to Student Login
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};