'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';
  const { signIn, signInWithGoogle, user, loading: authLoading } = useUser();
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectPath);
    }
  }, [user, authLoading, router, redirectPath]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim()) {
      setError(t('login.errors.emailRequired'));
      return;
    }

    if (!formData.password) {
      setError(t('login.errors.passwordRequired'));
      return;
    }

    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      router.push(redirectPath);
    } catch (err: any) {
      if (err.message.includes('user-not-found')) {
        setError(t('login.errors.noAccount'));
      } else if (err.message.includes('wrong-password')) {
        setError(t('login.errors.wrongPassword'));
      } else {
        setError(err.message || t('login.errors.signInFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || t('login.errors.googleFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="login-page">
        {/* Colorful Animated Background */}
        <div className="animated-bg">
          <div className="gradient-blob blob-1"></div>
          <div className="gradient-blob blob-2"></div>
          <div className="gradient-blob blob-3"></div>
          <div className="gradient-blob blob-4"></div>
          <div className="gradient-blob blob-5"></div>

          {/* Floating Shapes */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="floating-shape"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
                width: `${20 + Math.random() * 40}px`,
                height: `${20 + Math.random() * 40}px`,
              }}
            />
          ))}
        </div>

        {/* Form Container */}
        <div className="form-wrapper">
          <div className="form-card">
            {/* Header */}
            <div className="form-header">
              <div className="logo-wrapper">
                <div className="logo-icon">🔥</div>
              </div>
              <h1 className="form-title">{t('login.welcome')}</h1>
              <p className="form-subtitle">{t('login.subtitle')}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-alert">
                <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Email */}
              <div className="input-group">
                <label className="input-label">{t('login.emailLabel')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder={t('login.emailPlaceholder')}
                  required
                />
              </div>

              {/* Password */}
              <div className="input-group">
                <label className="input-label">{t('login.passwordLabel')}</label>
                <div className="input-with-icon">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder={t('login.passwordPlaceholder')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-icon-btn"
                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="checkbox-container">
                  <input type="checkbox" className="checkbox-input" />
                  <span className="checkbox-box">
                    <svg viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="checkbox-label">{t('login.rememberMe')}</span>
                </label>

                <Link href="/forgot-password" className="forgot-link">
                  {t('login.forgotPassword')}
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? (
                  <>
                    <svg className="btn-spinner" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
                    </svg>
                    {t('login.signingIn')}
                  </>
                ) : (
                  <>
                    {t('login.signIn')}
                    <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider">
              <span className="divider-line"></span>
              <span className="divider-text">{t('login.or')}</span>
              <span className="divider-line"></span>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="google-btn"
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('login.continueWithGoogle')}
            </button>

            {/* Signup Link */}
            <p className="footer-text">
              {t('login.noAccount')}{' '}
              <Link href="/signup" className="link-bold">{t('login.createAccount')}</Link>
            </p>

            {/* Promo Badge */}
            <div className="promo-badge">
              <div className="promo-icon">🎁</div>
              <div className="promo-content">
                <p className="promo-title">{t('login.promoTitle')}</p>
                <p className="promo-subtitle">{t('login.promoSubtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        /* Loading Screen */
        .loading-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        }

        .loading-spinner {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .spinner-ring {
          position: absolute;
          inset: 0;
          border: 4px solid transparent;
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 1.2s linear infinite;
        }

        .spinner-ring:nth-child(2) {
          border-top-color: #ffd700;
          animation-delay: 0.15s;
        }

        .spinner-ring:nth-child(3) {
          border-top-color: #ff6b9d;
          animation-delay: 0.3s;
        }

        /* Main Container */
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          font-family: 'Poppins', sans-serif;
        }

        /* Animated Background */
        .animated-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
          z-index: 0;
        }

        .gradient-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.6;
          animation: float-blob 20s ease-in-out infinite;
        }

        .blob-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(45deg, #ff6b9d, #c44569);
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .blob-2 {
          width: 350px;
          height: 350px;
          background: linear-gradient(45deg, #feca57, #ff9ff3);
          top: 50%;
          right: -100px;
          animation-delay: 4s;
        }

        .blob-3 {
          width: 450px;
          height: 450px;
          background: linear-gradient(45deg, #48dbfb, #0abde3);
          bottom: -150px;
          left: 30%;
          animation-delay: 8s;
        }

        .blob-4 {
          width: 300px;
          height: 300px;
          background: linear-gradient(45deg, #ff9ff3, #54a0ff);
          top: 20%;
          left: 40%;
          animation-delay: 12s;
        }

        .blob-5 {
          width: 380px;
          height: 380px;
          background: linear-gradient(45deg, #5f27cd, #00d2d3);
          bottom: 10%;
          right: 20%;
          animation-delay: 16s;
        }

        .floating-shape {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float-shape linear infinite;
          backdrop-filter: blur(2px);
        }

        /* Form Wrapper */
        .form-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          animation: slide-up 0.6s ease-out;
        }

        .form-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5);
        }

        /* Header */
        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .logo-icon {
          font-size: 3rem;
          animation: bounce-icon 2s ease-in-out infinite;
        }

        .form-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .form-subtitle {
          font-size: 1rem;
          color: #6b7280;
          font-weight: 500;
        }

        /* Error Alert */
        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
          border: 2px solid #ff6b9d;
          border-radius: 12px;
          color: #c44569;
          margin-bottom: 1.5rem;
          animation: shake 0.5s ease;
        }

        .error-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          font-family: 'Poppins', sans-serif;
          transition: all 0.3s ease;
          background: white;
          color: #1f2937;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-icon .form-input {
          padding-right: 3rem;
        }

        .input-icon-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          color: #9ca3af;
          transition: color 0.2s ease;
        }

        .input-icon-btn:hover {
          color: #667eea;
        }

        .input-icon-btn svg {
          width: 20px;
          height: 20px;
        }

        /* Form Options */
        .form-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.25rem;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .checkbox-box {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .checkbox-box svg {
          width: 12px;
          height: 10px;
          stroke: white;
          opacity: 0;
          transform: scale(0.5);
          transition: all 0.2s ease;
        }

        .checkbox-input:checked + .checkbox-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
        }

        .checkbox-input:checked + .checkbox-box svg {
          opacity: 1;
          transform: scale(1);
        }

        .checkbox-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .forgot-link {
          font-size: 0.875rem;
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .forgot-link:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        /* Submit Button */
        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 1rem;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-arrow {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
        }

        .submit-btn:hover:not(:disabled) .btn-arrow {
          transform: translateX(4px);
        }

        .btn-spinner {
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        .btn-spinner circle {
          stroke: currentColor;
          stroke-dasharray: 50;
          stroke-dashoffset: 25;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, #d1d5db, transparent);
        }

        .divider-text {
          font-size: 0.875rem;
          font-weight: 600;
          color: #9ca3af;
        }

        /* Google Button */
        .google-btn {
          width: 100%;
          padding: 1rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          color: #374151;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.3s ease;
        }

        .google-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .google-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .google-icon {
          width: 20px;
          height: 20px;
        }

        /* Footer Text */
        .footer-text {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .link-bold {
          color: #667eea;
          text-decoration: none;
          font-weight: 700;
          transition: color 0.2s ease;
        }

        .link-bold:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        /* Promo Badge */
        .promo-badge {
          margin-top: 1.5rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border: 2px solid #d1d5db;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .promo-badge:hover {
          background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .promo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .promo-content {
          flex: 1;
        }

        .promo-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .promo-subtitle {
          font-size: 0.75rem;
          color: #6b7280;
        }

        /* Animations */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float-blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 30px) scale(0.9);
          }
        }

        @keyframes float-shape {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-icon {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .login-page {
            padding: 1rem;
          }

          .form-card {
            padding: 2rem 1.5rem;
          }

          .form-title {
            font-size: 2rem;
          }

          .logo-icon {
            font-size: 2.5rem;
          }

          .form-options {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
        }
      `}</style>
    </>
  );
}
