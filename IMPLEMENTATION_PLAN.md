# Implementation Checklist: Payment Workflow

This checklist tracks implementation progress for the cart + Touch 'n Go payment flow.

## Phase 1: Data + Types
- [x] Define Firestore schema updates for orders, payment proof, voucher usage.
- [x] Define Storage path conventions for payment screenshots.
- [x] Update TypeScript types (Order, CartItem, Address, Notification).

## Phase 2: Cart
- [x] Implement cart state (add/remove/update quantity) and persistence.
- [x] Add "Add to Cart" buttons on product list + detail views.
- [x] Create cart page UI with totals and login gating.

## Phase 3: Checkout
- [x] Shipping form (address + phone) with validation.
- [x] Voucher eligibility and apply logic (RM20 per RM100).
- [x] Show Touch 'n Go QR code + wallet number + payable total.
- [x] Payment proof upload UI and validation.
- [x] Submit order with status = pending.

## Phase 4: Orders + Admin
- [x] Create Firestore order write/read utilities.
- [x] Admin orders list view (filters by status).
- [x] Order details view with payment proof preview.
- [x] Approve/Reject actions with status updates.

## Phase 5: Notifications
- [ ] Notification write on order status changes.
- [ ] User "Notifications" tab UI.

## Phase 6: Cleanup
- [ ] Remove/disable WhatsApp checkout path.
- [ ] Add empty states and error handling.
- [ ] Verify rules for products/orders/payment proofs.

## Status
- Started: 2026-01-08
- Last updated: 2026-01-09
