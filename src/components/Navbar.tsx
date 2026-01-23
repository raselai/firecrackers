
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useI18n } from '@/i18n/I18nProvider';

export default function Navbar() {
  const { user, loading, signOut } = useUser();
  const { items: cartItems } = useCart();
  const { locale, toggleLocale, t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartPulse, setCartPulse] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(cartItems.length);
  const router = useRouter();

  const categories = [
    { key: 'redCrackersSeries', slug: 'red-crackers-series' },
    { key: 'kidsSeries', slug: 'kids-series' },
    { key: 'handleSeries', slug: 'handle-series' },
    { key: 'fountainSeries', slug: 'fountain-series' },
    { key: 'firework4InchSeries', slug: '4inch-firework-series' },
    { key: 'firework6InchSeries', slug: '6inch-firework-series' },
    { key: 'firework7InchSeries', slug: '7inch-firework-series' },
    { key: 'firework8InchSeries', slug: '8inch-firework-series' },
    { key: 'firework10InchSeries', slug: '10inch-firework-series' },
    { key: 'firework11InchSeries', slug: '11inch-firework-series' },
    { key: 'firework12InchSeries', slug: '12inch-firework-series' },
    { key: 'bigHoleFireworkSeries', slug: 'big-hole-firework-series' },
    { key: 'giftBasket', slug: 'gift-basket' }
  ];


  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const nextLocaleLabel = locale === 'en' ? '中文' : 'EN';
  const voucherLabel = (count: number) =>
    count === 1 ? t('nav.voucher') : t('nav.vouchers');
  const voucherLabelLower = (count: number) =>
    count === 1 ? t('nav.voucherLower') : t('nav.vouchersLower');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search after submission
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search after submission
      setIsMobileMenuOpen(false); // Close mobile menu after search
    }
  };

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(false); // Close mobile menu when any link is clicked
  };

  const handleCategoriesToggle = () => {
    setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen);
    // Don't close mobile menu when toggling dropdowns
  };

  useEffect(() => {
    const currentCount = cartItems.length;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (currentCount > prevCartCount) {
      setCartPulse(true);
      timeout = setTimeout(() => setCartPulse(false), 900);
    }

    setPrevCartCount(currentCount);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [cartItems.length, prevCartCount]);

  return (
    <nav className="navbar-premium">
      <div className="navbar-glow-effect"></div>
      <div className="container navbar-container">
        {/* Logo */}
        <Link href="/" className="navbar-logo-premium">
          <Image
            src="/images/Logo/Logo.png"
            alt="FireWorks ML"
            width={180}
            height={70}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-desktop-premium">
          <Link href="/" className="navbar-link-premium">
            {t('nav.home')}
          </Link>
          <div className="navbar-dropdown-premium">
            <button
              className="navbar-dropdown-btn-premium"
              onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
              onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
            >
              {t('nav.categories')}
              <svg className="dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            {isCategoriesDropdownOpen && (
              <div
                className="navbar-dropdown-menu-premium"
                onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
                onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
              >
                <div className="dropdown-glow"></div>
                {categories.map((category) => (
                  <Link
                    key={category.key}
                    href={`/categories/${category.slug}`}
                    className="dropdown-item-premium"
                  >
                    <span className="dropdown-item-icon">&gt;</span>
                    {t(`nav.categorySeries.${category.key}`)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/cart" className="navbar-link-premium navbar-cart-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2L9 6M15 2L15 6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"/>
            </svg>
            {t('nav.cart')}
            {cartItems.length > 0 && (
              <span className="cart-badge">{cartItems.length}</span>
            )}
          </Link>

          <button
            type="button"
            className="navbar-link-premium"
            onClick={toggleLocale}
            aria-label={t('nav.toggleLanguage')}
          >
            {nextLocaleLabel}
          </button>

          {/* User Menu */}
          {!loading && (
            user ? (
              <div className="navbar-dropdown-premium navbar-user-menu">
                <button
                  className="navbar-user-btn-premium"
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="user-avatar-premium">
                    {(user.displayName || user.email || t('nav.user')).charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info-compact">
                    <span className="user-name-compact">{user.displayName || user.email || t('nav.user')}</span>
                    {user.vouchers > 0 && (
                      <span className="user-vouchers-compact">
                        {user.vouchers} {voucherLabelLower(user.vouchers)}
                      </span>
                    )}
                  </div>
                  <svg className="dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                {isUserMenuOpen && (
                  <div
                    className="navbar-dropdown-menu-premium user-dropdown-premium"
                    onMouseEnter={() => setIsUserMenuOpen(true)}
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="dropdown-glow"></div>

                    {/* Vouchers Highlight */}
                    {user.vouchers > 0 && (
                      <div className="voucher-highlight-premium">
                        <div className="voucher-icon-premium">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div className="voucher-details-premium">
                          <span className="voucher-count">{user.vouchers} {voucherLabel(user.vouchers)}</span>
                          <span className="voucher-value">RM{user.vouchers * 20}</span>
                        </div>
                      </div>
                    )}

                    <Link href="/account" className="dropdown-item-premium user-menu-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                      </svg>
                      {t('nav.myAccount')}
                    </Link>

                    <Link href="/account/referrals" className="dropdown-item-premium user-menu-item referral-link-premium">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                      {t('nav.referralsRewards')}
                      <span className="referral-badge">{t('nav.earnRm20')}</span>
                    </Link>

                    <Link href="/account/orders" className="dropdown-item-premium user-menu-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                      {t('nav.orders')}
                    </Link>

                    <Link href="/account/notifications" className="dropdown-item-premium user-menu-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z"/>
                      </svg>
                      {t('nav.notifications')}
                    </Link>

                    <Link href="/account/wishlist" className="dropdown-item-premium user-menu-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                      {t('nav.wishlist')}
                      {(user.wishlist?.length || 0) > 0 && (
                        <span className="wishlist-count-badge">{user.wishlist?.length || 0}</span>
                      )}
                    </Link>

                    <div className="dropdown-divider-premium"></div>

                    <button onClick={handleSignOut} className="dropdown-item-premium user-menu-item logout-item-premium">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links-premium">
                <Link href="/login" className="navbar-link-premium login-link-premium">
                  {t('nav.login')}
                </Link>
                <Link href="/signup" className="navbar-btn-premium signup-btn-premium">
                  {t('nav.signUp')}
                </Link>
              </div>
            )
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="navbar-search-premium">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder={t('nav.searchPlaceholder')}
            className="search-input-premium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Mobile Auth Buttons */}
        {!loading && !user && (
          <div className="navbar-mobile-auth">
            <Link href="/login" className="navbar-mobile-auth-link">
              {t('nav.login')}
            </Link>
            <Link href="/signup" className="navbar-mobile-auth-btn">
              {t('nav.signUp')}
            </Link>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="navbar-mobile-btn-premium"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={t('nav.toggleMobileMenu')}
        >
          <span className={`hamburger-premium ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-premium">
          <div className="mobile-menu-glow"></div>

          <form onSubmit={handleMobileSearch} className="mobile-search-premium">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder={t('nav.searchPlaceholder')}
              className="search-input-premium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <button
            type="button"
            className="mobile-link-premium"
            onClick={toggleLocale}
            aria-label={t('nav.toggleLanguage')}
          >
            {nextLocaleLabel}
          </button>

          <Link href="/" className="mobile-link-premium" onClick={handleMobileMenuClick}>
            {t('nav.home')}
          </Link>
          <div className="mobile-dropdown-premium">
            <button
              className="mobile-dropdown-btn-premium"
              onClick={handleCategoriesToggle}
            >
              {t('nav.categories')}
              <svg className={`dropdown-icon ${isCategoriesDropdownOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            {isCategoriesDropdownOpen && (
              <div className="mobile-dropdown-content-premium">
                {categories.map((category) => (
                  <Link
                    key={category.key}
                    href={`/categories/${category.slug}`}
                    className="mobile-dropdown-item-premium"
                    onClick={handleMobileMenuClick}
                  >
                    <span className="dropdown-item-icon">&gt;</span>
                    {t(`nav.categorySeries.${category.key}`)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/cart" className="mobile-link-premium mobile-cart-link" onClick={handleMobileMenuClick}>
            {t('nav.cart')} {cartItems.length > 0 && `(${cartItems.length})`}
          </Link>

          {/* Mobile User Menu */}
          {!loading && (
            user ? (
              <div className="mobile-user-section-premium">
                <div className="mobile-user-header-premium">
                  <div className="user-avatar-premium mobile-avatar">
                    {(user.displayName || user.email || t('nav.user')).charAt(0).toUpperCase()}
                  </div>
                  <div className="mobile-user-details">
                    <p className="mobile-user-name">{user.displayName || user.email || t('nav.user')}</p>
                    <p className="mobile-user-email">{user.email}</p>
                  </div>
                </div>

                {user.vouchers > 0 && (
                  <div className="mobile-voucher-highlight-premium">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{user.vouchers} {voucherLabel(user.vouchers)}</span>
                    <span className="mobile-voucher-value">RM{user.vouchers * 20}</span>
                  </div>
                )}

                <div className="mobile-divider-premium"></div>

                <Link href="/account" className="mobile-link-premium" onClick={handleMobileMenuClick}>
                  {t('nav.myAccount')}
                </Link>
                <Link href="/account/referrals" className="mobile-link-premium mobile-referral-link" onClick={handleMobileMenuClick}>
                  {t('nav.referralsRewards')}
                </Link>
                <Link href="/account/orders" className="mobile-link-premium" onClick={handleMobileMenuClick}>
                  {t('nav.orders')}
                </Link>
                <Link href="/account/notifications" className="mobile-link-premium" onClick={handleMobileMenuClick}>
                  {t('nav.notifications')}
                </Link>
                <Link href="/account/wishlist" className="mobile-link-premium" onClick={handleMobileMenuClick}>
                  {t('nav.wishlist')} {(user.wishlist?.length || 0) > 0 && `(${user.wishlist?.length || 0})`}
                </Link>

                <div className="mobile-divider-premium"></div>

                <button onClick={handleSignOut} className="mobile-link-premium mobile-logout-btn">
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="mobile-auth-section-premium">
                <Link href="/login" className="mobile-link-premium mobile-login-link" onClick={handleMobileMenuClick}>
                  {t('nav.login')}
                </Link>
                <Link href="/signup" className="mobile-btn-premium mobile-signup-btn" onClick={handleMobileMenuClick}>
                  {t('nav.signUp')}
                </Link>
              </div>
            )
          )}
        </div>
      )}

      <div className="mobile-bottom-bar">
        <Link href="/cart" className="mobile-bottom-item mobile-bottom-cart" aria-label={t('nav.cart')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 2L9 6M15 2L15 6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"/>
          </svg>
          <span>{t('nav.cart')}</span>
          {cartItems.length > 0 && (
            <span className={`mobile-cart-badge ${cartPulse ? 'cart-pulse' : ''}`}>
              {cartItems.length}
            </span>
          )}
        </Link>

        <button
          type="button"
          className="mobile-bottom-item mobile-bottom-menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={t('nav.toggleMobileMenu')}
        >
          <span className={`hamburger-premium ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span>{t('nav.menu')}</span>
        </button>
      </div>
    </nav>
  );
}
