# PresentAI Billing System Documentation

## Overview

PresentAI uses a robust billing system with **multiple redundant sync mechanisms** to ensure subscription data stays synchronized between Stripe and the PocketBase database. The system supports both real-time webhook processing and manual sync operations.

### Architecture at a Glance

```
User → Frontend → PocketBase Hooks → Stripe API
  ↓                    ↓               ↓
Billing UI ← Database ← Sync Utils ← Webhook Events
```

### Key Components
- **Frontend**: Nuxt.js billing interface with subscription management
- **Backend**: PocketBase with JavaScript hooks for Stripe integration
- **Sync Systems**: 4 different ways to keep data synchronized
- **Database**: PocketBase collections for users, customers, subscriptions, products, prices

---

## File Reference Guide

### Backend Files (PocketBase Hooks)

| File | Purpose | Key Functions |
|------|---------|---------------|
| `pb_hooks/stripe-webhook.pb.js` | **Real-time webhook processor** | Handles Stripe events at `/stripe` endpoint |
| `pb_hooks/manual-stripe-sync.pb.js` | **User self-service sync** | Manual sync at `/api/sync-stripe` endpoint |
| `pb_hooks/webhook-utils.js` | **Core business logic** | Shared sync utilities for all systems |
| `pb_hooks/stripe-checkout.pb.js` | **Checkout creation** | Creates Stripe checkout sessions |
| `pb_hooks/checkout-utils.js` | **Customer management** | Customer creation and session utilities |
| `pb_hooks/stripe-portal-link.pb.js` | **Portal access** | Customer billing portal links |
| `pb_hooks/product-price-sync-cron.pb.js` | **Daily product sync** | Runs at 1 AM to sync products/prices |
| `pb_hooks/subscription-sync-cron.pb.js` | **Daily subscription sync** | Runs at 2 AM to sync subscriptions |

### Frontend Files (Nuxt App)

| File | Purpose | Key Features |
|------|---------|--------------|
| `composables/useBilling.ts` | **Main billing operations** | Checkout, subscriptions, portal access |
| `composables/useStripeSync.ts` | **Manual sync interface** | User-triggered sync with status tracking |
| `pages/dashboard/billing.vue` | **Billing management UI** | Subscription plans, sync controls, status |
| `components/App/Billing/PricingCard.vue` | **Subscription plans** | Plan display and purchase buttons |
| `components/App/Billing/ActiveSubscriptionDetails.vue` | **Current subscription** | Active plan details and management |
| `types/billing.ts` | **TypeScript interfaces** | Type definitions for billing data |

### Database Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User accounts | `pro_account` (boolean), billing info |
| `customer` | Stripe customers | `stripe_customer_id`, `user_id` |
| `subscription` | User subscriptions | `stripe_subscription_id`, `status`, `price_id` |
| `product` | Stripe products | `stripe_product_id`, `name`, `description` |
| `price` | Stripe prices | `stripe_price_id`, `unit_amount`, `interval` |

---

## Complete Data Flow Walkthrough

### Step 1: User Initiates Subscription

**File**: `pages/dashboard/billing.vue` → `composables/useBilling.ts`

1. User clicks subscription plan button
2. Frontend calls `createCheckoutSession(priceId)`
3. Request sent to PocketBase `/create-checkout-session` endpoint

### Step 2: Checkout Session Creation

**File**: `pb_hooks/stripe-checkout.pb.js` + `pb_hooks/checkout-utils.js`

1. **Customer Creation/Lookup**:
   - Find existing customer record by user ID
   - If not found, create new Stripe customer via API
   - Save customer record in PocketBase `customer` collection

2. **Session Creation**:
   - Create Stripe checkout session with user's price selection
   - Set success/cancel URLs from environment variables
   - Return checkout URL to frontend

3. **Redirect**: User redirected to Stripe checkout page

### Step 3: Payment Processing (Multiple Sync Paths)

After successful payment, there are **4 ways** data gets synchronized:

#### Path A: Real-time Webhooks (Optional for Development)
**File**: `pb_hooks/stripe-webhook.pb.js` → `pb_hooks/webhook-utils.js`

1. Stripe sends webhook to `/stripe` endpoint
2. Webhook signature validated
3. `checkout.session.completed` event processed
4. Calls `handleCheckoutSessionCompleted()` in webhook-utils
5. Subscription data synced immediately

#### Path B: Auto-Sync After Checkout (Primary for Development)
**File**: `pages/dashboard/billing.vue`

1. User returns to billing page with `?success=true`
2. Page detects successful checkout
3. Auto-triggers manual sync after 1 second delay
4. Same sync logic as manual sync

#### Path C: Manual Sync (User-Triggered)
**File**: `composables/useStripeSync.ts` → `pb_hooks/manual-stripe-sync.pb.js`

1. User clicks "Sync with Stripe" button
2. Frontend calls `/api/sync-stripe` endpoint
3. Backend fetches all checkout sessions and subscriptions from Stripe
4. Processes each through webhook-utils handlers
5. Returns detailed sync results

#### Path D: Daily Cron Jobs (Consistency Backup)
**Files**: `pb_hooks/product-price-sync-cron.pb.js` + `pb_hooks/subscription-sync-cron.pb.js`

1. **1 AM**: Products and prices synced from Stripe
2. **2 AM**: All subscriptions synced from Stripe
3. Ensures long-term data consistency

### Step 4: Pro Status Update

**File**: `pb_hooks/webhook-utils.js` - `handleSubscriptionEvent()`

1. **Subscription Processing**:
   - Extract subscription data from Stripe
   - Update/create subscription record in PocketBase
   - Link subscription to user via customer relationship

2. **Pro Account Activation**:
   - If subscription status is 'active', 'trialing', or 'past_due'
   - Set `users.pro_account = true`
   - Update billing address and payment method

3. **Database Updates**:
   - Save subscription with period dates, status, price info
   - Update user record with pro status
   - Link all related records (user → customer → subscription → price → product)

### Step 5: UI Refresh

**File**: `pages/dashboard/billing.vue` + `composables/useBilling.ts`

1. After sync completion, refresh all billing data:
   - `fetchProducts()` - reload available plans
   - `fetchCurrentSubscription()` - get user's active subscription
   - `refreshUser()` - update user pro status in UI
   - `getSyncStatus()` - update sync status display

2. UI updates automatically show:
   - Pro badge instead of Free
   - Active subscription details
   - "Manage plan" button for billing portal access

---

## Sync Mechanisms Explained

### 1. Real-time Webhooks (Production Recommended)
- **When**: Stripe events trigger immediately
- **Pros**: Instant updates, best user experience
- **Cons**: Requires webhook forwarding in development
- **Setup**: `stripe listen --forward-to http://localhost:8090/stripe`

### 2. Manual Sync (Development Primary)
- **When**: User clicks sync button or auto-triggered after checkout
- **Pros**: Works without webhooks, user control, detailed status
- **Cons**: Requires user action for some updates
- **Usage**: Always available as fallback

### 3. Auto-Sync After Checkout
- **When**: User returns to billing page after successful payment
- **Pros**: Seamless experience, works without webhooks
- **Cons**: Only works for new subscriptions
- **Implementation**: 1-second delay after `?success=true` detection

### 4. Daily Cron Jobs
- **When**: 1 AM (products/prices), 2 AM (subscriptions)
- **Pros**: Ensures long-term consistency, catches edge cases
- **Cons**: Not real-time
- **Purpose**: Safety net for missed events

---

## Development vs Production

### Development Setup (Minimal)
```bash
# No webhook forwarding needed
cd backend && npm run dev
cd frontend && npm run dev
```
**Sync Strategy**: Auto-sync after checkout + manual sync + daily cron jobs

### Production Setup (Full)
```bash
# With webhook forwarding for real-time updates
stripe listen --forward-to https://your-api.com/stripe
```
**Sync Strategy**: All 4 sync mechanisms for maximum reliability

### Environment Variables Required

```bash
# In pocketbase/.env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PB_STRIPE_SUCCESS_URL=http://localhost:3000/dashboard/billing?success=true
PB_STRIPE_CANCEL_URL=http://localhost:3000/dashboard/billing?success=false
```

### Stripe Dashboard Setup
1. **Customer Portal**: https://dashboard.stripe.com/test/settings/billing/portal
   - Click "Activate" to enable billing portal
   - Required for "Manage plan" functionality

2. **Webhooks**: https://dashboard.stripe.com/test/webhooks
   - Add endpoint: `https://your-api.com/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.*`

---

## Troubleshooting Guide

### Common Issues

#### 1. "Free" Badge Not Updating After Payment
**Symptoms**: Payment successful but user still shows as "Free"
**Solution**: 
1. Check sync status in billing page
2. Click "Sync with Stripe" button
3. Verify auto-sync triggered (check console logs)

#### 2. Billing Portal 400 Error
**Symptoms**: "Unable to access billing portal"
**Solution**: 
1. Activate customer portal in Stripe Dashboard
2. Check improved error logs in PocketBase console
3. Verify customer record exists

#### 3. Webhook Events Not Received
**Symptoms**: No real-time updates
**Solution**: 
1. Use manual sync as workaround
2. Check webhook forwarding: `stripe listen --forward-to http://localhost:8090/stripe`
3. Verify webhook endpoint in Stripe Dashboard

#### 4. Duplicate Subscription Records
**Symptoms**: Multiple subscription cards in UI
**Solution**: 
1. Check for duplicate price records in database
2. Use manual sync to clean up data
3. Delete duplicate entries via PocketBase admin

### Verification Steps

1. **Check Sync Status**: Billing page shows sync status with checkmarks
2. **Manual Sync**: Always available as fallback - click "Sync with Stripe"
3. **Database Verification**: Check PocketBase admin for user/subscription records
4. **Stripe Dashboard**: Verify customer and subscription exist in Stripe

### Recovery Procedures

1. **Lost Sync**: Use manual sync button to recover
2. **Missing Customer**: Delete and recreate subscription
3. **Wrong Pro Status**: Manual sync will correct based on Stripe data
4. **Webhook Failures**: Daily cron jobs provide eventual consistency

---

## Quick Reference

### For Development
- **No webhooks needed**: Manual sync + auto-sync handles everything
- **Primary sync**: Auto-sync after checkout (1-second delay)
- **Fallback**: Manual sync button always available
- **Safety net**: Daily cron jobs at 1 AM and 2 AM

### For Production
- **Enable webhooks**: For real-time updates
- **Keep manual sync**: As fallback for webhook failures
- **Monitor cron jobs**: Ensure daily consistency checks run
- **Configure portal**: Activate Stripe customer portal

### Key API Endpoints
- `POST /create-checkout-session` - Start subscription flow
- `GET /create-portal-link` - Access billing portal
- `POST /api/sync-stripe` - Manual sync trigger
- `POST /stripe` - Webhook receiver (optional in dev)