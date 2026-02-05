import { auth } from '@/lib/firebase';
import { Order } from '@/types/order';

type UpdateAdminOrderStatusPayload = {
  orderId: string;
  status: Order['status'];
  reviewedBy?: string;
  rejectionReason?: string;
  returnReason?: string;
  returnAmount?: number;
  adminNotes?: string;
};

async function getAdminToken(): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user session found.');
  }
  return currentUser.getIdToken();
}

export async function updateAdminOrderStatus(params: UpdateAdminOrderStatusPayload): Promise<void> {
  const token = await getAdminToken();
  const response = await fetch(`/api/admin/orders/${encodeURIComponent(params.orderId)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      status: params.status,
      reviewedBy: params.reviewedBy,
      rejectionReason: params.rejectionReason,
      returnReason: params.returnReason,
      returnAmount: params.returnAmount,
      adminNotes: params.adminNotes
    })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Failed to update order status.');
  }
}
