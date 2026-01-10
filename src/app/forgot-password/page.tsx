'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';

export default function ForgotPassword() {
  const { resetPassword } = useUser();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!email.trim()) {
      setError(t('forgotPassword.errors.emailRequired'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('forgotPassword.errors.emailInvalid'));
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);

      // Handle specific error messages
      if (error.message.includes('user-not-found')) {
        setError(t('forgotPassword.errors.noAccount'));
      } else if (error.message.includes('invalid-email')) {
        setError(t('forgotPassword.errors.invalidEmail'));
      } else if (error.message.includes('too-many-requests')) {
        setError(t('forgotPassword.errors.tooManyRequests'));
      } else {
        setError(error.message || t('forgotPassword.errors.sendFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('forgotPassword.title')}</h1>
            <p className="mt-2 text-gray-600">
              {t('forgotPassword.subtitle')}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    {t('forgotPassword.successTitle')}
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      {t('forgotPassword.successBody')}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/login"
                      className="text-sm font-medium text-green-700 hover:text-green-600"
                    >
                      {t('forgotPassword.returnToLogin')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('forgotPassword.emailLabel')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={t('forgotPassword.emailPlaceholder')}
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('forgotPassword.sending') : t('forgotPassword.sendResetLink')}
              </button>
            </form>
          )}

          {/* Back to Login Link */}
          {!success && (
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                {t('forgotPassword.backToLogin')}
              </Link>
            </div>
          )}

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600 border-t pt-6">
            {t('forgotPassword.noAccount')}{' '}
            <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-medium">
              {t('forgotPassword.createOne')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
