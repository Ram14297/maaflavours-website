// src/app/api/README.md
# Maa Flavours — API Routes Reference

Complete map of all `/api/*` routes, their methods, auth requirements, and purpose.

---

## Authentication

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/send-otp`       | POST | None     | Send OTP via Twilio to Indian mobile |
| `/api/auth/verify-otp`     | POST | None     | Verify OTP, create Supabase session |
| `/api/auth/update-profile` | POST | Customer | Update name / email after first login |
| `/api/auth/logout`         | POST | Customer | Clear Supabase session cookie |

**OTP Flow:**
1. `POST /api/auth/send-otp` → `{ mobile }` → Twilio sends SMS
2. `POST /api/auth/verify-otp` → `{ mobile, otp }` → session cookie set
3. If new user: `POST /api/auth/update-profile` → `{ name, email }`

---

## Products (Public)

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/products`          | GET  | None | Paginated product list with filters |
| `/api/products/[slug]`   | GET  | None | Single product with variants, images, reviews |
| `/api/reviews/[productId]` | GET  | None | Paginated product reviews |
| `/api/reviews/[productId]` | POST | Customer | Submit a product review |

**Product listing params:** `?category=spicy&spice=medium&sort=price-asc&search=&featured=true&page=1&limit=12`

**Sort options:** `featured` (default) | `price-asc` | `price-desc` | `name` | `newest` | `rating`

---

## Coupons

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/coupons/validate` | POST | None | Validate coupon code against cart total |

```json
// Request
{ "code": "WELCOME50", "cartTotal": 35000 }

// Response (valid)
{ "valid": true, "coupon": { "code": "WELCOME50", "type": "flat", "value": 5000, "discountAmount": 5000 } }

// Response (invalid)
{ "valid": false, "error": "Minimum order ₹299 required" }
```

---

## Checkout & Orders

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/checkout/create-order`  | POST | Customer | Validate cart → create order → Razorpay order |
| `/api/checkout/verify-payment`| POST | None     | Verify Razorpay HMAC signature → confirm order |
| `/api/checkout/webhook`       | POST | None     | Razorpay webhook handler (signature verified) |
| `/api/orders/[orderId]`       | GET  | Customer | Fetch order detail for confirmation page |

**Create Order Request:**
```json
{
  "items": [{ "productSlug": "drumstick-pickle", "variantIndex": 0, "quantity": 2 }],
  "couponCode": "WELCOME50",
  "deliveryAddress": { "name": "Priya", "mobile": "9876543210", "address_line1": "...", "pincode": "523001", "city": "Ongole", "state": "Andhra Pradesh" },
  "paymentMethod": "razorpay_upi"
}
```

**For COD:** Returns `{ orderId, paymentMethod: "cod", total }` directly.  
**For Online:** Returns `{ razorpayOrderId, orderId, amount, currency, key, prefill }`.

**Razorpay Webhook Events handled:**
- `payment.captured` → `payment_status=paid, status=confirmed`
- `payment.failed`   → `payment_status=failed`
- `refund.created` / `refund.processed` → `status=refunded`

---

## Customer Account

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/account/orders`                  | GET    | Customer | Customer's order history |
| `/api/account/addresses`               | GET    | Customer | List saved addresses |
| `/api/account/addresses`               | POST   | Customer | Add new address |
| `/api/account/addresses/[addressId]`   | PUT    | Customer | Update address |
| `/api/account/addresses/[addressId]`   | DELETE | Customer | Delete address |
| `/api/account/wishlist`                | GET    | Customer | Get wishlist slugs |
| `/api/account/wishlist`                | POST   | Customer | Add product to wishlist |
| `/api/account/wishlist`                | DELETE | Customer | Remove from wishlist (`?slug=`) |

---

## Utilities

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/pincode`     | GET  | None | India Post pincode lookup (`?pin=523001`) |
| `/api/newsletter`  | POST | None | Subscribe email to newsletter |
| `/api/contact`     | POST | None | Submit contact form message |

---

## Admin Panel

All admin routes require `mf-admin-token` cookie (JWT signed with `ADMIN_JWT_SECRET`).

### Auth
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/admin/login`  | POST | None  | Email + password → sets `mf-admin-token` cookie |
| `/api/admin/logout` | POST | Admin | Clears `mf-admin-token` cookie |

### Dashboard & Analytics
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/admin/dashboard`   | GET | Admin | KPIs, chart data, recent orders, low stock |
| `/api/admin/analytics`   | GET | Admin | Revenue trends, product performance, city breakdown |

**Analytics params:** `?period=30d|90d|6m|1y` or `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

### Orders Management
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/admin/orders`              | GET   | Admin | Paginated orders with search/filter |
| `/api/admin/orders/[orderId]`    | GET   | Admin | Full order detail with items + status history |
| `/api/admin/orders/[orderId]`    | PATCH | Admin | Update status, tracking, internal notes |
| `/api/admin/orders/invoice`      | GET   | Admin | GST invoice data (`?orderId=xxx`) |

**Order PATCH body:**
```json
{
  "status": "shipped",
  "trackingId": "DTDC1234567890",
  "courierName": "DTDC",
  "trackingUrl": "https://dtdc.com/track?...",
  "internalNotes": "Fragile — mark on box"
}
```

**Order status flow:** `pending` → `confirmed` → `processing` → `packed` → `shipped` → `out_for_delivery` → `delivered`

### Products Management
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/admin/products`              | GET    | Admin | Paginated products with variants |
| `/api/admin/products`              | POST   | Admin | Create new product + variants |
| `/api/admin/products/[productId]`  | GET    | Admin | Product detail with variants + images |
| `/api/admin/products/[productId]`  | PUT    | Admin | Update product + variants |
| `/api/admin/products/[productId]`  | DELETE | Admin | Soft delete (sets is_active=false) |

### Inventory
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/admin/inventory` | GET   | Admin | All variants with stock levels |
| `/api/admin/inventory` | PATCH | Admin | Bulk update stock quantities |

### Customers
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/admin/customers`             | GET | Admin | Paginated customer list |
| `/api/admin/customers/[customerId]`| GET | Admin | Customer profile + orders + addresses |

### Coupons
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/admin/coupons`             | GET    | Admin | List coupons |
| `/api/admin/coupons`             | POST   | Admin | Create coupon |
| `/api/admin/coupons/[couponId]`  | PUT    | Admin | Update coupon |
| `/api/admin/coupons/[couponId]`  | DELETE | Admin | Deactivate coupon |

### Expenses
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/admin/expenses` | GET  | Admin | Monthly expense list with category totals + P&L |
| `/api/admin/expenses` | POST | Admin | Add expense |

**Expense params:** `?month=2025-07&category=ingredients`

### Settings & Uploads
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/admin/settings`  | GET   | Admin | All key-value settings |
| `/api/admin/settings`  | PATCH | Admin | Update settings |
| `/api/admin/upload`    | POST  | Admin | Upload image to Supabase Storage |
| `/api/admin/upload`    | DELETE| Admin | Delete image from Supabase Storage |

---

## Shared Utilities

### `src/lib/admin-auth.ts`
- `signAdminToken(payload)` — signs 24h JWT for admin
- `verifyAdminToken(req)` — verifies admin cookie/header
- `requireAdmin(req)` — returns payload or null
- `getPagination(searchParams)` — returns `{ page, limit, from, to }`
- `formatRupees(paise)` — `₹180` from `18000`

### `src/lib/supabase/server.ts`
- `createServerSupabaseClient()` — anon client with user session (reads RLS-restricted data)
- `createAdminSupabaseClient()` — service role client (bypasses RLS, for API routes)
- `createServerClient` — alias for `createServerSupabaseClient`
- `createAdminClient` — alias for `createAdminSupabaseClient`

---

## Error Response Format

All API routes return consistent error format:
```json
{ "error": "Human-readable error message" }
```

HTTP status codes used:
- `200` — Success
- `201` — Created
- `400` — Bad request / validation error
- `401` — Unauthenticated
- `403` — Forbidden (authenticated but insufficient permissions)
- `404` — Not found
- `409` — Conflict (duplicate)
- `429` — Rate limited
- `500` — Server error

---

## Price Format

**All monetary values in the API are in PAISE** (1 INR = 100 paise).

```typescript
// Display
const displayPrice = `₹${(priceInPaise / 100).toLocaleString('en-IN')}`;
// e.g. 18000 → "₹180"

// Store / compare
const paise = Math.round(rupeeAmount * 100);
// e.g. 180 → 18000
```

---

## Environment Variables

```bash
# Required for OTP auth
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=

# Required for payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Required for database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Required for admin
ADMIN_JWT_SECRET=       # Random 32+ char secret for signing admin JWT
ADMIN_EMAIL=admin@maaflavours.com
ADMIN_PASSWORD_HASH=    # bcrypt hash of admin password

# Site
NEXT_PUBLIC_SITE_URL=https://maaflavours.com
```
