'use client';

import { FormEvent, useEffect, useRef } from 'react';
import { AdminUserDetail, AdminUserListItem } from '@/types/admin';

/* ─── Props ─── */
interface UsersPanelProps {
  users: AdminUserListItem[];
  usersLoading: boolean;
  usersError: string | null;
  usersSearch: string;
  setUsersSearch: (value: string) => void;
  usersHasMore: boolean;
  selectedAdminUser: AdminUserDetail | null;
  userDetailLoading: boolean;
  handleSearchUsers: (event: FormEvent<HTMLFormElement>) => void;
  handleOpenUserDetail: (uid: string) => void;
  loadMoreUsers: () => void;
  setSelectedAdminUser: (user: AdminUserDetail | null) => void;
}

/* ─── Helpers ─── */
function getInitials(name: string): string {
  if (!name || name === '-') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-fuchsia-500', 'bg-indigo-500',
  'bg-sky-500', 'bg-teal-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500',
];

function avatarColor(uid: string): string {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ─── Sub-components ─── */

function Avatar({ name, uid, size = 'md' }: { name: string; uid: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };
  return (
    <div className={`${sizeClasses[size]} ${avatarColor(uid)} rounded-full flex items-center justify-center text-white font-semibold shrink-0 shadow-sm`}>
      {getInitials(name)}
    </div>
  );
}

function VoucherPill({ available, used }: { available: number; used: number }) {
  const total = available + used;
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${available > 0 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-50 text-slate-500 ring-1 ring-slate-200'}`}>
        {available} avail
      </span>
      {used > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 ring-1 ring-slate-200">
          {used} used
        </span>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'admin';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide uppercase ${isAdmin ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-300' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'}`}>
      {role}
    </span>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-4 pb-2">
      <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function DetailField({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-1">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <span className={`text-sm text-slate-800 text-right ${mono ? 'font-mono' : ''}`}>{value || '-'}</span>
    </div>
  );
}

/* ─── User Row (card-list hybrid) ─── */
function UserRow({
  user,
  onView,
  isSelected,
  detailLoading,
}: {
  user: AdminUserListItem;
  onView: () => void;
  isSelected: boolean;
  detailLoading: boolean;
}) {
  return (
    <div
      className={`group flex items-center gap-4 px-4 py-3 border-b border-slate-100 last:border-b-0 transition-colors cursor-pointer hover:bg-violet-50/40 ${isSelected ? 'bg-violet-50 border-l-2 border-l-violet-500' : 'border-l-2 border-l-transparent'}`}
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onView()}
    >
      <Avatar name={user.displayName} uid={user.uid} />

      {/* Primary info — name + email */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-800 truncate">
            {user.displayName || '-'}
          </span>
        </div>
        <span className="text-xs text-slate-500 truncate block">{user.email || '-'}</span>
      </div>

      {/* Phone — hidden on small screens */}
      <div className="hidden lg:block w-28 text-xs text-slate-600 truncate">
        {user.phoneNumber || '-'}
      </div>

      {/* Referral code */}
      <div className="hidden md:block w-24">
        {user.referralCode ? (
          <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            {user.referralCode}
          </span>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        )}
      </div>

      {/* Vouchers */}
      <div className="hidden sm:flex w-32 justify-center">
        <VoucherPill available={user.vouchers} used={user.vouchersUsed} />
      </div>

      {/* Created */}
      <div className="hidden xl:block w-24 text-xs text-slate-500">
        {formatDate(user.createdAt)}
      </div>

      {/* View button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onView(); }}
        disabled={detailLoading}
        className="shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold border border-violet-300 text-violet-700 bg-white hover:bg-violet-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        View
      </button>
    </div>
  );
}

/* ─── Detail Drawer ─── */
function DetailDrawer({
  user,
  onClose,
}: {
  user: AdminUserDetail;
  onClose: () => void;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 overflow-y-auto animate-slide-in lg:static lg:h-auto lg:max-w-none lg:shadow-none lg:border lg:rounded-xl lg:animate-none"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-5 py-4 flex items-center gap-4 z-10">
          <Avatar name={user.displayName} uid={user.uid} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-slate-800 text-base truncate">{user.displayName || '-'}</h3>
              <RoleBadge role={user.role} />
            </div>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close detail panel"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-6">
          {/* ── Contact ── */}
          <SectionDivider label="Contact" />
          <DetailField label="Email" value={user.email || '-'} />
          <DetailField label="Phone" value={user.phoneNumber || '-'} />
          <DetailField label="UID" value={user.uid} mono />

          {/* ── Referrals & Vouchers ── */}
          <SectionDivider label="Referrals & Vouchers" />
          <DetailField label="Referral Code" value={user.referralCode || '-'} mono />
          <DetailField label="Referred By" value={user.referredBy || '-'} mono />
          <DetailField label="Referral Count" value={user.referralCount} />
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-slate-500">Vouchers</span>
            <VoucherPill available={user.vouchers} used={user.vouchersUsed} />
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-slate-500">Registration Voucher</span>
            {user.hasRegistrationVoucher ? (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.registrationVoucherUsed ? 'bg-slate-100 text-slate-500 line-through' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'}`}>
                {user.registrationVoucherUsed ? 'Used' : 'Available'}
              </span>
            ) : (
              <span className="text-xs text-slate-400">-</span>
            )}
          </div>

          {/* ── Timestamps ── */}
          <SectionDivider label="Activity" />
          <DetailField label="Created" value={formatDateTime(user.createdAt)} />
          <DetailField label="Last Updated" value={formatDateTime(user.updatedAt)} />

          {/* ── Addresses ── */}
          <SectionDivider label={`Addresses (${user.addresses.length})`} />
          {user.addresses.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No saved addresses.</p>
          ) : (
            <div className="grid gap-2 mt-1">
              {user.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`rounded-lg border px-3 py-2.5 text-xs ${addr.isDefault ? 'border-violet-200 bg-violet-50/50' : 'border-slate-200 bg-slate-50/50'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-700">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="px-1.5 py-px rounded text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-600">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 leading-relaxed">
                    <div>{addr.fullName} &middot; {addr.phoneNumber}</div>
                    <div>{addr.streetAddress}</div>
                    <div>{addr.city}, {addr.state} {addr.postalCode}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Column Headers (desktop) ─── */
function ListHeader() {
  return (
    <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400">
      <div className="w-10" /> {/* avatar spacer */}
      <div className="flex-1">User</div>
      <div className="hidden lg:block w-28">Phone</div>
      <div className="hidden md:block w-24">Referral</div>
      <div className="hidden sm:block w-32 text-center">Vouchers</div>
      <div className="hidden xl:block w-24">Created</div>
      <div className="w-16" /> {/* action spacer */}
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════ */
export default function UsersPanel({
  users,
  usersLoading,
  usersError,
  usersSearch,
  setUsersSearch,
  usersHasMore,
  selectedAdminUser,
  userDetailLoading,
  handleSearchUsers,
  handleOpenUserDetail,
  loadMoreUsers,
  setSelectedAdminUser,
}: UsersPanelProps) {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Users</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Customer profiles, addresses, and referral voucher details
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchUsers} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="6.5" cy="6.5" r="5" />
              <path d="M10.5 10.5L14 14" />
            </svg>
            <input
              type="text"
              value={usersSearch}
              onChange={(e) => setUsersSearch(e.target.value)}
              placeholder="Email, referral code, or UID..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow"
            />
          </div>
          <button
            type="submit"
            disabled={usersLoading}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* ── Error ── */}
      {usersError && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {usersError}
        </div>
      )}

      {/* ── Content Grid ── */}
      <div className={`grid gap-5 ${selectedAdminUser ? 'lg:grid-cols-[1fr_400px]' : 'grid-cols-1'}`}>
        {/* User List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <ListHeader />

          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <UserRow
                key={u.uid}
                user={u}
                onView={() => handleOpenUserDetail(u.uid)}
                isSelected={selectedAdminUser?.uid === u.uid}
                detailLoading={userDetailLoading}
              />
            ))}
          </div>

          {/* Empty state */}
          {users.length === 0 && !usersLoading && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="10" cy="7" r="4" />
                  <path d="M2 18c0-4 3.5-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600">No users found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search query</p>
            </div>
          )}

          {/* Loading skeleton */}
          {usersLoading && users.length === 0 && (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 rounded bg-slate-200" />
                    <div className="h-2 w-48 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              {usersLoading ? 'Loading...' : `${users.length} user${users.length !== 1 ? 's' : ''} loaded`}
            </span>
            {usersHasMore && (
              <button
                type="button"
                onClick={loadMoreUsers}
                disabled={usersLoading}
                className="px-3 py-1.5 rounded-md text-xs font-semibold border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {usersLoading ? 'Loading...' : 'Load more'}
              </button>
            )}
          </div>
        </div>

        {/* Detail Drawer */}
        {selectedAdminUser && (
          <DetailDrawer
            user={selectedAdminUser}
            onClose={() => setSelectedAdminUser(null)}
          />
        )}
      </div>
    </div>
  );
}
