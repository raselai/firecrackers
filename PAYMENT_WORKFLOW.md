# Payment + Order Workflow (Touch 'n Go)

## Goal
Replace the WhatsApp-only ordering flow with a cart + checkout flow that requires a logged-in user, captures shipping details and payment proof, and lets admins approve orders after verification.

## Roles
- Buyer: logged-in customer
- Admin: reviews orders and payment proofs, then approves or rejects

## Buyer Flow
1) Account required
   - Buyer must create an account and log in before checkout.

2) Add to Cart
   - Buyer adds one or more products to the cart.

3) Cart + Shipping Details
   - Buyer enters shipping address and phone number in the cart or checkout step.
   - Required fields:
     - Full name
     - Phone number
     - Street address
     - City
     - State
     - Postal code

4) Voucher Eligibility (Referral Program)
   - Each buyer has a referral code/QR.
   - When a referred friend registers under the code, the referrer earns 1 voucher.
   - Each voucher is worth RM20.
   - Voucher claim rule: can claim 1 voucher for every RM100 in cart total.
   - Claimed voucher amount is deducted from the total payable amount.
   - If cart total is less than RM100, vouchers cannot be applied.

5) Checkout: Payment Instructions
   - Show Touch 'n Go eWallet QR code image.
   - Show wallet number text.
   - Display total amount to pay (after voucher discount, if applied).

6) Upload Payment Proof
   - Buyer uploads payment screenshot after transferring.
   - Upload required before placing the order.

7) Place Order
   - Order is created with status "pending" (awaiting admin verification).

## Admin Flow
1) View Orders
   - Admin dashboard lists orders with status and payment proof.

2) Verify Payment Proof
   - Admin reviews uploaded screenshot and payment details.

3) Approve or Reject
   - Approve: order status becomes "approved".
   - Reject: order status becomes "rejected" with optional reason.

## Data Storage (Firebase)
- Orders stored in Firestore.
- Payment proof image stored in Firebase Storage.
- Order record stores:
  - User ID
  - Cart items (product IDs, quantities, price at time of order)
  - Shipping address + phone number
  - Voucher usage (count, discount amount)
  - Payment proof URL
  - Status: pending | approved | rejected
  - Timestamps

## Admin Dashboard Requirements
- Orders list with filters by status.
- Order detail view showing:
  - Buyer details
  - Shipping address
  - Cart items + totals
  - Payment proof image
  - Approve / Reject actions
  
## User Notifications
- Add a "Notifications" tab in the user account area.
- Show order status updates (pending, approved, rejected) with timestamps.

## Open Questions
## Decisions
- Payment: Full payment only (no partial/split payments).
- Admins can edit shipping details after order creation.
- Notify users in their account on approval/rejection (no email requirement yet).
- Vouchers cannot be claimed if cart total is below RM100.

## Done When
- Buyer can add items to cart and checkout only when logged in.
- Buyer must enter shipping details and upload payment proof.
- Order stored with payment proof URL and status "pending".
- Admin can approve or reject orders in dashboard.
