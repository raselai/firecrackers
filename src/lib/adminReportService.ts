import { auth } from '@/lib/firebase';
import { SalesSummaryResponse } from '@/types/salesReport';

type SalesSummaryParams = {
  from: string;
  to: string;
  raw?: boolean;
};

async function getAdminToken(): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user session found.');
  }
  return currentUser.getIdToken();
}

export async function fetchSalesSummary(params: SalesSummaryParams): Promise<SalesSummaryResponse> {
  const token = await getAdminToken();
  const query = new URLSearchParams({
    from: params.from,
    to: params.to
  });
  if (params.raw) query.set('raw', '1');

  const response = await fetch(`/api/admin/reports/sales/summary?${query.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Failed to fetch sales summary.');
  }

  return response.json();
}

export async function fetchSalesCsv(params: { from: string; to: string }): Promise<Blob> {
  const token = await getAdminToken();
  const query = new URLSearchParams({
    from: params.from,
    to: params.to
  });
  const response = await fetch(`/api/admin/reports/sales/export?${query.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    let message = 'Failed to export sales report.';
    try {
      const payload = await response.json();
      message = payload.error || message;
    } catch (_error) {
      // Ignore parsing issues and keep default message.
    }
    throw new Error(message);
  }

  return response.blob();
}

export async function reconcileSalesSummary(params: { from: string; to: string }): Promise<void> {
  const token = await getAdminToken();
  const response = await fetch('/api/admin/reports/sales/reconcile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Failed to reconcile sales summary.');
  }
}
