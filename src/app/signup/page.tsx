'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, signInWithGoogle, user, loading: authLoading } = useUser();
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: searchParams.get('ref') || ''
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError(t('signup.errors.fullNameRequired'));
      return;
    }

    if (!formData.email.trim()) {
      setError(t('signup.errors.emailRequired'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('signup.errors.passwordLength'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('signup.errors.passwordMismatch'));
      return;
    }

    if (!acceptedTerms) {
      setError(t('signup.errors.acceptTerms'));
      return;
    }

    setLoading(true);

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.referralCode || undefined
      );
      router.push('/');
    } catch (err: any) {
      setError(err.message || t('signup.errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle(formData.referralCode || undefined);
      router.push('/');
    } catch (err: any) {
      setError(err.message || t('signup.errors.googleFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return '#ff6b9d';
    if (passwordStrength < 70) return '#ffa500';
    return '#4ade80';
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 40) return t('signup.strengthWeak');
    if (passwordStrength < 70) return t('signup.strengthMedium');
    return t('signup.strengthStrong');
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
      <div className="signup-page">
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
                <div className="logo-icon">✨</div>
              </div>
              <h1 className="form-title">{t('signup.title')}</h1>
              <p className="form-subtitle">{t('signup.subtitle')}</p>
            </div>

            {/* Registration Voucher Banner */}
            <div className="registration-voucher-banner">
              <svg viewBox="0 0 20 20" fill="currentColor" className="banner-icon">
                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
              </svg>
              <span>{t('signup.registrationVoucherInfo')}</span>
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
            <form onSubmit={handleSubmit} className="signup-form">
              {/* Full Name */}
              <div className="input-group">
                <label className="input-label">{t('signup.fullNameLabel')}</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder={t('signup.fullNamePlaceholder')}
                  required
                />
              </div>

              {/* Email */}
              <div className="input-group">
                <label className="input-label">{t('signup.emailLabel')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder={t('signup.emailPlaceholder')}
                  required
                />
              </div>

              {/* Password */}
              <div className="input-group">
                <label className="input-label">{t('signup.passwordLabel')}</label>
                <div className="input-with-icon">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder={t('signup.passwordPlaceholder')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-icon-btn"
                    aria-label={showPassword ? t('signup.hidePassword') : t('signup.showPassword')}
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

                {/* Password Strength */}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar-bg">
                      <div
                        className="strength-bar-fill"
                        style={{
                          width: `${passwordStrength}%`,
                          backgroundColor: getStrengthColor()
                        }}
                      />
                    </div>
                    <p className="strength-text" style={{ color: getStrengthColor() }}>
                      {getStrengthLabel()}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="input-group">
                <label className="input-label">{t('signup.confirmPasswordLabel')}</label>
                <div className="input-with-icon">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder={t('signup.confirmPasswordPlaceholder')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="input-icon-btn"
                    aria-label={showConfirmPassword ? t('signup.hidePassword') : t('signup.showPassword')}
                  >
                    {showConfirmPassword ? (
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

              {/* Referral Code */}
              <div className="input-group">
                <label className="input-label">
                  {t('signup.referralLabel')} <span className="optional-text">({t('signup.optional')})</span>
                </label>
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="form-input referral-input"
                  placeholder={t('signup.referralPlaceholder')}
                />
                {formData.referralCode && (
                  <p className="referral-info">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('signup.referralReward')}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="terms-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="checkbox-input"
                    required
                  />
                  <span className="checkbox-box">
                    <svg viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="checkbox-label">
                    {t('signup.termsPrefix')}{' '}
                    <Link href="/terms" className="link">{t('signup.termsLabel')}</Link>{' '}
                    {t('signup.termsAnd')}{' '}
                    <Link href="/privacy" className="link">{t('signup.privacyLabel')}</Link>
                  </span>
                </label>
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
                    {t('signup.creatingAccount')}
                  </>
                ) : (
                  <>
                    {t('signup.createAccount')}
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
              <span className="divider-text">{t('signup.or')}</span>
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
              {t('signup.continueWithGoogle')}
            </button>

            {/* Login Link */}
            <p className="footer-text">
              {t('signup.haveAccount')}{' '}
              <Link href="/login" className="link-bold">{t('signup.signInHere')}</Link>
            </p>
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
        .signup-page {
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
          max-width: 500px;
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

        /* Registration Voucher Banner */
        .registration-voucher-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 2px solid #6ee7b7;
          border-radius: 12px;
          color: #065f46;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .banner-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          color: #059669;
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
        .signup-form {
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

        .optional-text {
          color: #9ca3af;
          font-weight: 400;
          font-size: 0.75rem;
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

        .referral-input {
          text-transform: uppercase;
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

        /* Password Strength */
        .password-strength {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.25rem;
        }

        .strength-bar-bg {
          flex: 1;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .strength-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: all 0.4s ease;
        }

        .strength-text {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Referral Info */
        .referral-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #10b981;
          margin-top: 0.25rem;
          font-weight: 500;
        }

        .referral-info svg {
          width: 16px;
          height: 16px;
        }

        /* Terms */
        .terms-group {
          margin-top: 0.5rem;
        }

        .checkbox-container {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
        }

        .checkbox-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .checkbox-box {
          width: 22px;
          height: 22px;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          flex-shrink: 0;
          transition: all 0.2s ease;
          margin-top: 2px;
        }

        .checkbox-box svg {
          width: 14px;
          height: 12px;
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
          line-height: 1.5;
        }

        .link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .link:hover {
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
          .signup-page {
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
        }
      `}</style>
    </>
  );
}
