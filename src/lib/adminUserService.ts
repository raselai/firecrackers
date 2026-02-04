import { auth } from '@/lib/firebase';
import { AdminUserDetail, AdminUsersListResponse } from '@/types/admin';

type FetchAdminUsersParams = {
  limit?: number;
  cursor?: string;
  search?: string;
};

async function getAdminAuthToken(): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user session found.');
  }

  return currentUser.getIdToken();
}

export async function fetchAdminUsers(
  params: FetchAdminUsersParams = {}
): Promise<AdminUsersListResponse> {
  const token = await getAdminAuthToken();
  const searchParams = new URLSearchParams();

  if (typeof params.limit === 'number') searchParams.set('limit', String(params.limit));
  if (params.cursor) searchParams.set('cursor', params.cursor);
  if (params.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const response = await fetch(`/api/admin/users${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.error || 'Failed to fetch admin users.');
  }

  return response.json();
}

export async function fetchAdminUserById(uid: string): Promise<AdminUserDetail> {
  const token = await getAdminAuthToken();
  const response = await fetch(`/api/admin/users/${encodeURIComponent(uid)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.error || 'Failed to fetch user detail.');
  }

  return response.json();
}
