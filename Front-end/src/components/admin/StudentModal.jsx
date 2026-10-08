import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  X,
} from 'lucide-react';
const inputClass = (hasError, extraClass = '') =>
  `w-full px-3.5 py-2.5 bg-black border rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition ${
    hasError ? 'border-red-500' : 'border-zinc-800'
  } ${extraClass}`;

const emptyStudent = {
  name: '',
  email: '',
  phone: '',
  password: '',
};

export const StudentModal = ({ student, students, onClose, onSave }) => {
  const isEditing = Boolean(student);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: student || emptyStudent });

  useEffect(() => {
    reset(student || emptyStudent);
  }, [reset, student]);

  const renderError = (field, id) =>
    errors[field] && (
      <p id={id} className="text-xs text-red-400" role="alert">
        {errors[field].message}
      </p>
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-modal-title"
        className="relative w-full max-w-xl bg-zinc-950 border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div>
            <h3 id="student-modal-title" className="text-lg font-bold text-white">
              {isEditing ? 'Edit Student' : 'Add New Student'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isEditing
                ? 'Email and password cannot be changed here.'
                : 'Fill in the information below to enroll a new student.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
          onSubmit={handleSubmit(onSave)}
          noValidate
        >
          <div className="space-y-1.5">
            <label htmlFor="student-name" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              Full Name
            </label>
            <input
              id="student-name"
              type="text"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'student-name-error' : undefined}
              {...register('name', {
                required: 'Full name is required.',
                validate: (value) =>
                  value.trim().length >= 3 || 'Enter at least 3 characters.',
              })}
              placeholder="e.g. Eleanor Vance"
              className={inputClass(errors.name)}
            />
            {renderError('name', 'student-name-error')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="student-email" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  id="student-email"
                  type="email"
                  value={student.email}
                  readOnly
                  aria-readonly="true"
                  className={inputClass(false, 'cursor-not-allowed text-zinc-400')}
                />
              ) : (
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
                    validate: (value) =>
                      !students.some(
                        (item) =>
                          item.email.toLowerCase() === value.trim().toLowerCase(),
                      ) || 'This email is already in use.',
                  })}
                  placeholder="student@university.edu"
                  className={inputClass(errors.email)}
                />
              )}
              {!isEditing && renderError('email', 'student-email-error')}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="student-phone" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                Phone Number
              </label>
              <input
                id="student-phone"
                type="tel"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'student-phone-error' : undefined}
                {...register('phone', {
                  required: 'Phone number is required.',
                  pattern: {
                    value: /^\+?[\d\s().-]{7,20}$/,
                    message: 'Enter a valid phone number.',
                  },
                  validate: (value) =>
                    value.replace(/\D/g, '').length >= 7 ||
                    'Enter a valid phone number.',
                })}
                placeholder="+1 (555) 000-0000"
                className={inputClass(errors.phone)}
              />
              {renderError('phone', 'student-phone-error')}
            </div>
          </div>

          {!isEditing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="student-password" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="student-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'student-password-error' : undefined}
                    {...register('password', {
                      required: 'Password is required.',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters.',
                      },
                    })}
                    placeholder="At least 8 characters"
                    className={inputClass(errors.password, 'pr-11')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-white transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {renderError('password', 'student-password-error')}
              </div>

            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Saving...'
                  : isEditing
                    ? 'Save Changes'
                    : 'Add Student'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
