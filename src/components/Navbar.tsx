
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
  const { user, loading, signOut } = useUser();
  const { items: cartItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGroundDropdownOpen, setIsGroundDropdownOpen] = useState(false);
  const [isAerialDropdownOpen, setIsAerialDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const groundCategories = [
    'Sparklers',
    'Fountains',
    'Ground Spinners',
    'Wheels',
    'Snakes',
    'Smoke Bombs',
    'Poppers',
    'Fire Crackers',
    'Party Crackers',
    'Confetti Cannons'
  ];

  const aerialCategories = [
    'Rockets',
    'Roman Candles',
    'Aerial Shells',
    'Multi-Shot Cakes',
    'Mines'
  ];

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

  const handleDropdownToggle = (dropdownType: 'ground' | 'aerial') => {
    if (dropdownType === 'ground') {
      setIsGroundDropdownOpen(!isGroundDropdownOpen);
    } else {
      setIsAerialDropdownOpen(!isAerialDropdownOpen);
    }
    // Don't close mobile menu when toggling dropdowns
  };

  return (
    <nav className="navbar">
      <div className="container">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <Image
            src="/images/Logo/Logo.png"
            alt="FireWorks ML"
            width={200}
            height={80}
            style={{ objectFit: 'contain' }}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-desktop">
          <Link href="/" className="navbar-link">Home</Link>
          
          {/* Ground Effects Dropdown */}
          <div className="navbar-dropdown-container">
            <button
              className="navbar-dropdown-btn"
              onMouseEnter={() => setIsGroundDropdownOpen(true)}
              onMouseLeave={() => setIsGroundDropdownOpen(false)}
            >
              Ground Effects
              <span className="dropdown-arrow">▼</span>
            </button>
            {isGroundDropdownOpen && (
              <div
                className="navbar-dropdown"
                onMouseEnter={() => setIsGroundDropdownOpen(true)}
                onMouseLeave={() => setIsGroundDropdownOpen(false)}
              >
                {groundCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/categories/${category.toLowerCase().replace(' ', '-')}`}
                    className="dropdown-link"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Aerial Effects Dropdown */}
          <div className="navbar-dropdown-container">
            <button
              className="navbar-dropdown-btn"
              onMouseEnter={() => setIsAerialDropdownOpen(true)}
              onMouseLeave={() => setIsAerialDropdownOpen(false)}
            >
              Aerial Effects
              <span className="dropdown-arrow">▼</span>
            </button>
            {isAerialDropdownOpen && (
              <div
                className="navbar-dropdown"
                onMouseEnter={() => setIsAerialDropdownOpen(true)}
                onMouseLeave={() => setIsAerialDropdownOpen(false)}
              >
                {aerialCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/categories/${category.toLowerCase().replace(' ', '-')}`}
                    className="dropdown-link"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/categories/others" className="navbar-link">Others</Link>
          <Link href="/cart" className="navbar-link">
            Cart {cartItems.length > 0 ? `(${cartItems.length})` : ''}
          </Link>

          {/* User Menu */}
          {!loading && (
            user ? (
              <div className="navbar-dropdown-container">
                <button
                  className="navbar-dropdown-btn user-menu-btn"
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-2">{user.displayName || user.email || 'User'}</span>
                  <span className="dropdown-arrow ml-1">▼</span>
                </button>
                {isUserMenuOpen && (
                  <div
                    className="navbar-dropdown user-dropdown"
                    onMouseEnter={() => setIsUserMenuOpen(true)}
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <Link href="/account" className="dropdown-link user-dropdown-link">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      My Account
                    </Link>
                    <Link href="/account/orders" className="dropdown-link user-dropdown-link">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Orders
                    </Link>
                    <Link href="/account/wishlist" className="dropdown-link user-dropdown-link">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Wishlist
                      {(user.wishlist?.length || 0) > 0 && (
                        <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {user.wishlist?.length || 0}
                        </span>
                      )}
                    </Link>
                    <Link href="/account/referrals" className="dropdown-link user-dropdown-link">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Referrals
                    </Link>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-link voucher-info">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">
                        {user.vouchers} Voucher{user.vouchers !== 1 ? 's' : ''}
                      </span>
                      <span className="ml-auto text-green-600 font-bold">RM{user.vouchers * 20}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleSignOut} className="dropdown-link user-dropdown-link logout-btn">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links">
                <Link href="/login" className="navbar-link login-link">Login</Link>
                <Link href="/signup" className="navbar-link signup-link">Sign Up</Link>
              </div>
            )
          )}

        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="navbar-search">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">🔍</button>
        </form>

        {/* Mobile Menu Button */}
        <button 
          className="navbar-mobile-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <form onSubmit={handleMobileSearch} className="mobile-search">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">🔍</button>
          </form>
          
          <Link href="/" className="mobile-link" onClick={handleMobileMenuClick}>Home</Link>
          
          <div className="mobile-dropdown">
            <button
              className="mobile-dropdown-btn"
              onClick={() => handleDropdownToggle('ground')}
            >
              Ground Effects
              <span className="dropdown-arrow">▼</span>
            </button>
            {isGroundDropdownOpen && (
              <div className="mobile-dropdown-content">
                {groundCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/categories/${category.toLowerCase().replace(' ', '-')}`}
                    className="mobile-dropdown-link"
                    onClick={handleMobileMenuClick}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mobile-dropdown">
            <button
              className="mobile-dropdown-btn"
              onClick={() => handleDropdownToggle('aerial')}
            >
              Aerial Effects
              <span className="dropdown-arrow">▼</span>
            </button>
            {isAerialDropdownOpen && (
              <div className="mobile-dropdown-content">
                {aerialCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/categories/${category.toLowerCase().replace(' ', '-')}`}
                    className="mobile-dropdown-link"
                    onClick={handleMobileMenuClick}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/categories/others" className="mobile-link" onClick={handleMobileMenuClick}>Others</Link>

          {/* Mobile User Menu */}
          {!loading && (
            user ? (
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">{user.displayName || user.email || 'User'}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <Link href="/account" className="mobile-link" onClick={handleMobileMenuClick}>
                  My Account
                </Link>
                <Link href="/account/orders" className="mobile-link" onClick={handleMobileMenuClick}>
                  Orders
                </Link>
                <Link href="/account/wishlist" className="mobile-link" onClick={handleMobileMenuClick}>
                  Wishlist {(user.wishlist?.length || 0) > 0 && `(${user.wishlist?.length || 0})`}
                </Link>
                <Link href="/account/referrals" className="mobile-link" onClick={handleMobileMenuClick}>
                  Referrals
                </Link>
                <div className="mobile-voucher-info">
                  {user.vouchers} Voucher{user.vouchers !== 1 ? 's' : ''} (RM{user.vouchers * 20})
                </div>
                <button onClick={handleSignOut} className="mobile-link logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <div className="mobile-auth-section">
                <Link href="/login" className="mobile-link mobile-login" onClick={handleMobileMenuClick}>
                  Login
                </Link>
                <Link href="/signup" className="mobile-link mobile-signup" onClick={handleMobileMenuClick}>
                  Sign Up
                </Link>
              </div>
            )
          )}

        </div>
      )}
    </nav>
  );
}
