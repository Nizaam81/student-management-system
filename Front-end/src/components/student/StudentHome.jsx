import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  LogOut, 
  Edit3, 
  Check, 
  X, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Award, 
  MapPin, 
  Calendar, 
  BadgeCheck, 
  IdCard 
} from 'lucide-react';
import api from '../../config/axios';
import { clearTokens, getAccessToken } from '../../config/jwt';
import {
  clearCurrentUser,
  setCurrentUser,
  updateCurrentUser,
} from '../../store/studentSlice';
import { clearStudents } from '../../store/adminSlice';

const profileInputClass = (hasError) =>
  `w-full px-3.5 py-2.5 bg-black border rounded-xl text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition ${
    hasError ? 'border-red-500' : 'border-zinc-700'
  }`;

export const StudentHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.student.profile);
  const [isLoading, setIsLoading] = useState(!currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const profile = {
    cgpa: 'N/A',
    address: 'Not provided',
    enrolledDate: currentUser?.createdAt
      ? new Date(currentUser.createdAt).toLocaleDateString()
      : '—',
    ...currentUser,
  };
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: profile || {} });

  useEffect(() => {
    if (currentUser) {
      reset(profile);
      setIsLoading(false);
      return undefined;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      navigate('/', { replace: true });
      return undefined;
    }

    let isCurrent = true;
    api
      .get('/api/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(({ data }) => {
        if (!isCurrent) return;
        if (data.user) {
          dispatch(setCurrentUser(data.user));
          return;
        }
        throw new Error('The profile response did not include user data.');
      })
      .catch((error) => {
        if (!isCurrent) return;
        clearTokens();
        dispatch(clearCurrentUser());
        toast.error(
          error.response?.data?.message || error.message || 'Unable to load your profile.',
        );
        navigate('/', { replace: true });
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [currentUser, dispatch, navigate, reset]);

  const startEditing = () => {
    reset(profile);
    setIsEditing(true);
  };

  const handleSave = async ({ name, phone }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('Your session has expired. Please log in again.');
      }

      const { data } = await api.patch(
        '/api/users/profile',
        { name, phone },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!data.user) {
        throw new Error('The profile update response did not include user data.');
      }

      dispatch(updateCurrentUser(data.user));
      reset({ ...profile, ...data.user });
      setIsEditing(false);
      setSavedSuccess(true);
      toast.success(data.message || 'Profile updated successfully.');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      const responseData = error.response?.data;
      const fieldErrors = responseData?.errors;
      let hasMappedError = false;

      if (fieldErrors && typeof fieldErrors === 'object') {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          if ((field === 'name' || field === 'phone') && typeof message === 'string') {
            setError(field, { type: 'server', message });
            hasMappedError = true;
          }
        });
      }

      if (!hasMappedError || responseData?.message !== 'Validation failed') {
        toast.error(
          responseData?.message || error.message || 'Unable to update profile.',
        );
      }
    }
  };

  const handleCancel = () => {
    reset(profile);
    setIsEditing(false);
  };

  const handleLogout = () => {
    clearTokens();
    dispatch(clearCurrentUser());
    dispatch(clearStudents());
    navigate('/', { replace: true });
  };

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-black flex items-center justify-center text-sm text-zinc-400">
        Loading your profile...
      </main>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-white" />
              <span className="text-xs uppercase font-mono tracking-widest text-zinc-400">
                Student Self-Service Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {profile.name ? profile.name.split(' ')[0] : 'Student'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing && (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-zinc-300" />
                <span>Edit Profile</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shadow-sm"
              title="Sign out of your account"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-zinc-950 border border-white/40 text-white flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-white" />
              <div>
                <p className="text-sm font-medium">Profile Details Updated Successfully</p>
                <p className="text-xs text-zinc-400">Profile details updated for this session.</p>
              </div>
            </div>
            <button
              onClick={() => setSavedSuccess(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Central Card Displaying User Details */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle B&W border highlight */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-700 via-white to-zinc-700" />

          {/* Card Top Banner / Identity Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-800">
            <div className="flex items-center gap-5">
              {/* Monogram Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white text-black font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-white/5 border-2 border-white">
                  {profile.name
                    ? profile.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                    : 'ST'}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-black p-1 rounded-full border border-zinc-800">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {profile.name}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 font-mono flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-zinc-500" />
                  <span>ID: {profile.studentId}</span>
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Enrolled: {profile.enrolledDate}
                </p>
              </div>
            </div>

            {/* Quick Action Button on Card */}
            <div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={startEditing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs sm:text-sm font-medium text-white transition cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Details</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-transparent hover:bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    form="student-profile-form"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form / Details Body */}
          {isEditing ? (
            /* Editable Mode */
            <form
              id="student-profile-form"
              onSubmit={handleSubmit(handleSave)}
              className="mt-8 space-y-6"
              noValidate
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="profile-name" className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'profile-name-error' : undefined}
                    {...register('name', {
                      required: 'Full name is required.',
                      validate: (value) =>
                        value.trim().length >= 3 || 'Enter at least 3 characters.',
                    })}
                    className={profileInputClass(errors.name)}
                  />
                  {errors.name && <p id="profile-name-error" className="text-xs text-red-400" role="alert">{errors.name.message}</p>}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="profile-email" className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={profile.email || ''}
                    readOnly
                    aria-readonly="true"
                    className={`${profileInputClass(false)} cursor-not-allowed text-zinc-400`}
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label htmlFor="profile-phone" className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'profile-phone-error' : undefined}
                    {...register('phone', {
                      required: 'Phone number is required.',
                      pattern: {
                        value: /^[1-9]\d{9}$/,
                        message: 'Enter a valid 10-digit phone number.',
                      },
                    })}
                    className={profileInputClass(errors.phone)}
                  />
                  {errors.phone && <p id="profile-phone-error" className="text-xs text-red-400" role="alert">{errors.phone.message}</p>}
                </div>

                {/* Address (Full Width) */}
                
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-semibold transition cursor-pointer shadow-md flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Read-Only Mode */
            <div className="mt-8 space-y-8">
              {/* Primary User Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Detail Item: Name */}
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-mono uppercase tracking-wider">Full Name</span>
                  </div>
                  <p className="text-sm font-semibold text-white truncate">{profile.name}</p>
                </div>

                {/* Detail Item: Email */}
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-mono uppercase tracking-wider">Email Address</span>
                  </div>
                  <p className="text-sm font-semibold text-white truncate">{profile.email}</p>
                </div>

                {/* Detail Item: Phone */}
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-mono uppercase tracking-wider">Phone Number</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{profile.phone}</p>
                </div>

              
                

                

              </div>
            </div>
          )}

          {/* Quick Academic Snapshot Cards */}
         
        </div>

      </div>
    </div>
  );
};
