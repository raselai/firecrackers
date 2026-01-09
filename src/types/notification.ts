export interface Notification {
  id: string;
  userId: string;
  type: 'order_status';
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: Date;
}
