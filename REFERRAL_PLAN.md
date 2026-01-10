# Referral Program Plan

## Goal
Reward existing customers when they bring in new customers. Each successful referral earns the referrer an RM20 voucher. Vouchers are visible in the referrer’s profile and can be used at checkout based on order value.

## Business Rules
- Referral reward: referrer earns 1 voucher worth RM20 when a new user signs up using their referral code.
- Voucher value: RM20 each.
- Voucher usage: 1 voucher can be used for every RM100 of cart total.
  - RM100 = 1 voucher
  - RM200 = 2 vouchers
  - RM300 = 3 vouchers
  - and so on
- Vouchers reduce the total payable amount at checkout.

## Customer Journey
1) Customer shares referral code or QR link with a friend.
2) Friend signs up using the referral code.
3) Referrer receives 1 RM20 voucher.
4) Referrer sees updated voucher count in their profile.
5) At checkout, the system allows voucher usage based on cart total (RM100 per voucher).

## What We Will Implement (Step by Step)
1) Validate referral code at signup and ensure referral is recorded once.
2) Award 1 voucher to the referrer and store it on the referrer’s profile.
3) Show updated voucher count in the profile and referral page.
4) Enforce voucher usage rule at checkout based on cart total (RM100 per voucher).
5) Ensure vouchers are deducted when used and usage is tracked.

## Success Criteria
- A referral signup reliably creates a reward for the referrer.
- Referrer’s voucher count increases and is visible in profile.
- Checkout only allows vouchers based on cart total (RM100 per voucher).
- Voucher discounts are applied correctly and consistently.
