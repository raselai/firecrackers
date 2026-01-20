'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';
import { addAddress, updateAddress, deleteAddress } from '@/lib/userService';
import { Address } from '@/types/user';
import { nanoid } from 'nanoid';

export default function ProfilePage() {
  const { user, firebaseUser, loading, updateProfile, refreshUser } = useUser();
  const router = useRouter();
  const { t } = useI18n();

  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: '',
    fullName: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false
  });

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login?redirect=/account/profile');
    }
  }, [firebaseUser, loading, router]);

  useEffect(() => {
    if (!loading && firebaseUser) {
      refreshUser();
    }
  }, [loading, firebaseUser, refreshUser]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setMessageType('');

    try {
      await updateProfile({
        displayName,
        phoneNumber: phoneNumber || undefined
      });
      setMessage(t('accountProfile.messages.profileUpdated'));
      setMessageType('success');
    } catch (error: any) {
      setMessage(error.message || t('accountProfile.messages.profileUpdateFailed'));
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage('');
    setMessageType('');

    try {
      if (editingAddress) {
        // Update existing address
        await updateAddress(user.uid, editingAddress.id, addressForm);
        setMessage(t('accountProfile.messages.addressUpdated'));
        setMessageType('success');
      } else {
        // Add new address
        const newAddress: Address = {
          id: nanoid(10),
          ...addressForm
        };
        await addAddress(user.uid, newAddress);
        setMessage(t('accountProfile.messages.addressAdded'));
        setMessageType('success');
      }

      // Reset form
      setAddressForm({
        label: '',
        fullName: '',
        phoneNumber: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        isDefault: false
      });
      setShowAddressForm(false);
      setEditingAddress(null);
      await refreshUser();
    } catch (error: any) {
      setMessage(error.message || t('accountProfile.messages.addressSaveFailed'));
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user || !confirm(t('accountProfile.confirmDelete'))) return;

    setSaving(true);
    setMessage('');
    setMessageType('');

    try {
      await deleteAddress(user.uid, addressId);
      setMessage(t('accountProfile.messages.addressDeleted'));
      setMessageType('success');
      await refreshUser();
    } catch (error: any) {
      setMessage(error.message || t('accountProfile.messages.addressDeleteFailed'));
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      label: address.label,
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user) return;

    setSaving(true);
    setMessage('');
    setMessageType('');

    try {
      const address = user.addresses.find(a => a.id === addressId);
      if (address) {
        await updateAddress(user.uid, addressId, { ...address, isDefault: true });
        setMessage(t('accountProfile.messages.defaultUpdated'));
        setMessageType('success');
        await refreshUser();
      }
    } catch (error: any) {
      setMessage(error.message || t('accountProfile.messages.defaultUpdateFailed'));
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || (firebaseUser && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('accountProfile.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const defaultUserName = t('account.defaultUserName');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {(user.displayName || user.email || defaultUserName).charAt(0).toUpperCase()}
                </div>
                <h3 className="text-center mt-3 font-semibold text-gray-900">
                  {user.displayName || user.email || defaultUserName}
                </h3>
                <p className="text-center text-sm text-gray-500">{user.email}</p>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/account"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {t('account.dashboard')}
                </Link>
                <Link
                  href="/account/profile"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-orange-50 text-orange-600 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('account.profile')}
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {t('account.orders')}
                </Link>
                <Link
                  href="/account/notifications"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z" />
                  </svg>
                  {t('account.notifications')}
                </Link>
                <Link
                  href="/account/wishlist"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {t('account.wishlist')}
                </Link>
                <Link
                  href="/account/referrals"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {t('account.referrals')}
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('accountProfile.title')}</h1>

            {/* Message */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  messageType === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {message}
              </div>
            )}

            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('accountProfile.personalInfo')}</h2>
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('accountProfile.displayName')}
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('accountProfile.email')}
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('accountProfile.emailLocked')}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('accountProfile.phoneOptional')}
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={t('accountProfile.phonePlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('accountProfile.referralCode')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={user.referralCode}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                        disabled
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(user.referralCode);
                          setMessage(t('accountProfile.messages.referralCopied'));
                          setMessageType('success');
                          setTimeout(() => {
                            setMessage('');
                            setMessageType('');
                          }, 2000);
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                      >
                        {t('accountProfile.copy')}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('accountProfile.availableVouchers')}
                    </label>
                    <input
                      type="text"
                      value={`${user.vouchers} (RM${user.vouchers * 20})`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('accountProfile.voucherHint')}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? t('accountProfile.saving') : t('accountProfile.saveChanges')}
                  </button>
                </div>
              </form>
            </div>

            {/* Saved Addresses */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{t('accountProfile.savedAddresses')}</h2>
                <button
                  onClick={() => {
                    setShowAddressForm(true);
                    setEditingAddress(null);
                    setAddressForm({
                      label: '',
                      fullName: '',
                      phoneNumber: '',
                      streetAddress: '',
                      city: '',
                      state: '',
                      postalCode: '',
                      isDefault: false
                    });
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('accountProfile.addNewAddress')}
                </button>
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="mb-6 p-6 border-2 border-orange-200 rounded-lg bg-orange-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingAddress ? t('accountProfile.editAddress') : t('accountProfile.newAddress')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('accountProfile.addressLabel')}
                      </label>
                      <input
                        type="text"
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        placeholder={t('accountProfile.addressLabelPlaceholder')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('accountProfile.fullName')}
                      </label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('accountProfile.phoneNumber')}
                      </label>
                      <input
                        type="tel"
                        value={addressForm.phoneNumber}
                        onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                        placeholder={t('accountProfile.phonePlaceholder')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('accountProfile.streetAddress')}
                      </label>
                      <input
                        type="text"
                        value={addressForm.streetAddress}
                        onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('accountProfile.city')}
                      </label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('accountProfile.state')}
                      </label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder={t('accountProfile.statePlaceholder')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('accountProfile.postalCode')}
                      </label>
                      <input
                        type="text"
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        placeholder={t('accountProfile.postalPlaceholder')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                        {t('accountProfile.setDefault')}
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {saving
                        ? t('accountProfile.saving')
                        : editingAddress
                        ? t('accountProfile.updateAddress')
                        : t('accountProfile.addAddress')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {t('accountProfile.cancel')}
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              {user.addresses?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border-2 rounded-lg p-4 ${
                        address.isDefault
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{address.label}</h3>
                          {address.isDefault && (
                            <span className="inline-block bg-orange-500 text-white text-xs px-2 py-1 rounded mt-1">
                              {t('accountProfile.defaultBadge')}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700">{address.fullName}</p>
                      <p className="text-gray-600 text-sm">{address.phoneNumber}</p>
                      <p className="text-gray-600 text-sm mt-2">
                        {address.streetAddress}<br />
                        {address.city}, {address.state} {address.postalCode}
                      </p>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                        >
                          {t('accountProfile.edit')}
                        </button>
                        {!address.isDefault && (
                          <>
                            <button
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              {t('accountProfile.setAsDefault')}
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              {t('accountProfile.delete')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !showAddressForm && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">{t('accountProfile.noSavedAddresses')}</p>
                  </div>
                )
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
