// src/lib/email.ts
// Maa Flavours — Transactional Email via Resend
// Sends branded order notification emails to customers automatically.
// If RESEND_API_KEY is not set, all calls are silently skipped (non-fatal).

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = "Maa Flavours <orders@maaflavours.com>";
const SITE   = process.env.NEXT_PUBLIC_SITE_URL || "https://maaflavours.com";

// ─── Colour tokens (match the site brand) ────────────────────────────────────
const C = {
  brown:    "#4A2C0A",
  crimson:  "#C0272D",
  gold:     "#C8960C",
  cream:    "#FAFAF5",
  white:    "#FFFFFF",
  grey:     "#6B6B6B",
  lightBg:  "#FDF6EC",
};

// ─── Shared email shell ───────────────────────────────────────────────────────
function shell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Maa Flavours</title>
</head>
<body style="margin:0;padding:0;background:${C.lightBg};font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${C.lightBg};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(74,44,10,0.10);">

        <!-- Gold top bar -->
        <tr><td style="height:4px;background:linear-gradient(90deg,transparent,${C.gold} 25%,#E8B84B 50%,${C.gold} 75%,transparent);"></td></tr>

        <!-- Header -->
        <tr><td style="background:${C.brown};padding:24px 32px;text-align:center;">
          <img src="https://maaflavours.com/maa-flavours-logo.png" alt="Maa Flavours" width="80" height="80" style="display:block;margin:0 auto 10px;border-radius:50%;object-fit:cover;border:2px solid rgba(200,150,12,0.4);" />
          <div style="font-size:20px;font-weight:800;color:${C.white};letter-spacing:0.5px;">Maa Flavours</div>
          <div style="font-size:11px;color:rgba(232,184,75,0.85);margin-top:4px;letter-spacing:1.5px;">AUTHENTIC ANDHRA HOMEMADE PICKLES</div>
        </td></tr>

        <!-- Content -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:${C.lightBg};padding:20px 32px;border-top:1px solid rgba(200,150,12,0.15);text-align:center;">
          <p style="margin:0;font-size:12px;color:${C.grey};">
            <a href="https://wa.me/919701452929" style="color:#25D366;font-weight:700;text-decoration:none;">💬 WhatsApp</a>
            &nbsp;&nbsp;·&nbsp;&nbsp;
            <a href="tel:+919701452929" style="color:${C.crimson};font-weight:700;text-decoration:none;">📞 Call +91 97014 52929</a>
            &nbsp;&nbsp;·&nbsp;&nbsp;
            <a href="${SITE}/account/orders" style="color:${C.crimson};text-decoration:none;">Track Order</a>
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:#aaa;">
            Maa Flavours, Ongole, Andhra Pradesh — 523001
          </p>
        </td></tr>

        <!-- Gold bottom bar -->
        <tr><td style="height:4px;background:linear-gradient(90deg,transparent,${C.gold} 25%,#E8B84B 50%,${C.gold} 75%,transparent);"></td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Reusable button ──────────────────────────────────────────────────────────
function btn(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
    <tr><td style="background:${C.crimson};border-radius:10px;padding:14px 28px;text-align:center;">
      <a href="${url}" style="color:${C.white};font-weight:700;font-size:15px;text-decoration:none;">${text}</a>
    </td></tr>
  </table>`;
}

// ─── Order items table ────────────────────────────────────────────────────────
function itemsTable(items: OrderItem[]): string {
  if (!items?.length) return "";
  const rows = items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(200,150,12,0.1);color:${C.brown};font-size:14px;">
        ${i.emoji || "🫙"} ${i.product_name} <span style="color:${C.grey};font-size:12px;">(${i.variant_label})</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(200,150,12,0.1);text-align:center;color:${C.grey};font-size:14px;">×${i.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(200,150,12,0.1);text-align:right;color:${C.brown};font-size:14px;font-weight:600;">₹${Math.round(i.total_price / 100)}</td>
    </tr>`).join("");

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
    <thead>
      <tr>
        <th style="text-align:left;font-size:11px;color:${C.grey};text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Item</th>
        <th style="text-align:center;font-size:11px;color:${C.grey};text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Qty</th>
        <th style="text-align:right;font-size:11px;color:${C.grey};text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Price</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  product_name: string;
  variant_label: string;
  quantity: number;
  total_price: number;  // paise
  emoji?: string;
}

interface SendOrderConfirmedArgs {
  to:          string;
  name:        string;
  orderNumber: string;
  orderId:     string;
  items:       OrderItem[];
  total:       number;   // paise
  method:      string;
  address:     string;
}

interface SendOrderShippedArgs {
  to:          string;
  name:        string;
  orderNumber: string;
  orderId:     string;
  courier:     string;
  trackingId:  string;
}

interface SendOrderStatusArgs {
  to:          string;
  name:        string;
  orderNumber: string;
  orderId:     string;
  total?:      number;   // paise (for cancellation)
  isPrepaid?:  boolean;
}

// ─── Core send wrapper ────────────────────────────────────────────────────────
async function send(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return; // silently skip if not configured
  if (!to || !to.includes("@")) return;    // no valid email, skip

  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) console.error("[email] Resend error:", error);
    else console.log("[email] Sent:", subject, "→", to);
  } catch (err: any) {
    console.error("[email] Failed:", err.message); // non-fatal
  }
}

// ─── 1. Order Confirmed ───────────────────────────────────────────────────────
export async function sendOrderConfirmedEmail(args: SendOrderConfirmedArgs): Promise<void> {
  const { to, name, orderNumber, orderId, items, total, method, address } = args;
  const firstName   = name.split(" ")[0];
  const totalRs     = Math.round(total / 100);
  const methodLabel = method === "cod" ? "Cash on Delivery" : method === "phonepe_qr" ? "PhonePe QR / UPI" : "Online Payment";
  const isCod       = method === "cod";

  const html = shell(`
    <!-- Status badge -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:rgba(46,125,50,0.1);border:1.5px solid rgba(46,125,50,0.3);border-radius:50px;padding:8px 20px;">
        <span style="color:#2E7D32;font-weight:700;font-size:14px;">✅ Order Confirmed</span>
      </div>
    </div>

    <h2 style="margin:0 0 4px;color:${C.brown};font-size:22px;">Hi ${firstName}! 👋</h2>
    <p style="margin:0 0 20px;color:${C.grey};font-size:15px;line-height:1.6;">
      Your order has been ${isCod ? "placed" : "confirmed and we're preparing it with love"}.
      Here's your order summary:
    </p>

    <!-- Order info box -->
    <div style="background:${C.lightBg};border-radius:12px;padding:16px 20px;margin-bottom:20px;border:1px solid rgba(200,150,12,0.2);">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:${C.grey};">Order Number</td>
          <td style="font-size:13px;font-weight:700;color:${C.brown};text-align:right;">${orderNumber}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:${C.grey};padding-top:8px;">Payment</td>
          <td style="font-size:13px;font-weight:600;color:${C.brown};text-align:right;padding-top:8px;">${methodLabel}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:${C.grey};padding-top:8px;">Deliver to</td>
          <td style="font-size:13px;color:${C.brown};text-align:right;padding-top:8px;max-width:220px;">${address}</td>
        </tr>
      </table>
    </div>

    <!-- Items -->
    ${itemsTable(items)}

    <!-- Total -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
      <tr>
        <td style="font-size:16px;font-weight:800;color:${C.brown};">Total ${isCod ? "(Pay on delivery)" : "Paid"}</td>
        <td style="font-size:18px;font-weight:800;color:${C.crimson};text-align:right;">₹${totalRs}</td>
      </tr>
    </table>

    <!-- What happens next -->
    <div style="background:rgba(200,150,12,0.06);border-radius:10px;padding:16px 20px;margin-top:24px;border:1px solid rgba(200,150,12,0.2);">
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:${C.brown};">📦 What happens next?</p>
      <p style="margin:0;font-size:13px;color:${C.brown};line-height:1.8;">
        1️⃣ We'll carefully pack your pickles<br/>
        2️⃣ Hand it over to our courier partner<br/>
        3️⃣ You'll get a <strong>shipping email with tracking ID</strong> the moment it's dispatched
      </p>
      <p style="margin:10px 0 0;font-size:12px;color:${C.grey};">Delivery in 5–7 working days · Fragile items are bubble-wrapped for safe transit.</p>
    </div>
  `);

  await send(to, `Order Confirmed — ${orderNumber} | Maa Flavours`, html);
}

// ─── 2. Order Shipped ─────────────────────────────────────────────────────────
export async function sendOrderShippedEmail(args: SendOrderShippedArgs): Promise<void> {
  const { to, name, orderNumber, orderId, courier, trackingId } = args;
  const firstName = name.split(" ")[0];

  const html = shell(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:rgba(200,150,12,0.1);border:1.5px solid rgba(200,150,12,0.3);border-radius:50px;padding:8px 20px;">
        <span style="color:${C.gold};font-weight:700;font-size:14px;">🚚 Your Order is On the Way!</span>
      </div>
    </div>

    <h2 style="margin:0 0 4px;color:${C.brown};font-size:22px;">Great news, ${firstName}! 🎉</h2>
    <p style="margin:0 0 24px;color:${C.grey};font-size:15px;line-height:1.6;">
      Your pickles have been dispatched and are heading your way. Here are the shipping details:
    </p>

    <div style="background:${C.lightBg};border-radius:12px;padding:20px;border:1px solid rgba(200,150,12,0.2);">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:${C.grey};">Order Number</td>
          <td style="font-size:13px;font-weight:700;color:${C.brown};text-align:right;">${orderNumber}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:${C.grey};padding-top:12px;">Courier</td>
          <td style="font-size:13px;font-weight:600;color:${C.brown};text-align:right;padding-top:12px;">${courier || "Courier Partner"}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:${C.grey};padding-top:12px;">Tracking ID</td>
          <td style="font-size:15px;font-weight:800;color:${C.crimson};text-align:right;padding-top:12px;">${trackingId || "—"}</td>
        </tr>
      </table>
    </div>

    <p style="margin:20px 0 0;font-size:14px;color:${C.grey};text-align:center;line-height:1.6;">
      Keep an eye on your doorstep! 🫙<br/>
      If you have any questions, WhatsApp us at <strong>+91 97014 52929</strong>
    </p>

    ${btn("Track Your Order →", `${SITE}/account`)}
  `);

  await send(to, `Your Order is Shipped — ${orderNumber} | Maa Flavours`, html);
}

// ─── 3. Order Delivered ───────────────────────────────────────────────────────
export async function sendOrderDeliveredEmail(args: SendOrderStatusArgs): Promise<void> {
  const { to, name, orderNumber } = args;
  const firstName = name.split(" ")[0];

  const html = shell(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:rgba(46,125,50,0.1);border:1.5px solid rgba(46,125,50,0.3);border-radius:50px;padding:8px 20px;">
        <span style="color:#2E7D32;font-weight:700;font-size:14px;">🎉 Delivered Successfully!</span>
      </div>
    </div>

    <h2 style="margin:0 0 4px;color:${C.brown};font-size:22px;">Your pickles have arrived, ${firstName}! 🫙</h2>
    <p style="margin:0 0 24px;color:${C.grey};font-size:15px;line-height:1.6;">
      Order <strong>${orderNumber}</strong> has been delivered. We hope you love every jar!
    </p>

    <div style="background:${C.lightBg};border-radius:12px;padding:20px;border:1px solid rgba(200,150,12,0.2);text-align:center;">
      <p style="margin:0;font-size:28px;">🫙🌶️❤️</p>
      <p style="margin:12px 0 0;font-size:14px;color:${C.brown};font-weight:600;line-height:1.6;">
        "The way Maa always made it"
      </p>
      <p style="margin:8px 0 0;font-size:13px;color:${C.grey};line-height:1.6;">
        Made with love, no preservatives, just pure Andhra flavour.
      </p>
    </div>

    <div style="margin-top:24px;background:rgba(192,39,45,0.04);border-radius:12px;padding:16px 20px;border:1px solid rgba(192,39,45,0.12);text-align:center;">
      <p style="margin:0;font-size:14px;color:${C.brown};line-height:1.6;">
        Loved it? Share the love on Instagram 📸<br/>
        <a href="https://instagram.com/maaflavours" style="color:${C.crimson};font-weight:700;text-decoration:none;">@maaflavours</a>
      </p>
    </div>

    ${btn("Order Again →", `${SITE}/products`)}
  `);

  await send(to, `Delivered! Enjoy your pickles 🫙 — ${orderNumber} | Maa Flavours`, html);
}

// ─── 4. Order Cancelled ───────────────────────────────────────────────────────
export async function sendOrderCancelledEmail(args: SendOrderStatusArgs): Promise<void> {
  const { to, name, orderNumber, total, isPrepaid } = args;
  const firstName = name.split(" ")[0];
  const totalRs   = total ? Math.round(total / 100) : 0;

  const html = shell(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:rgba(192,39,45,0.08);border:1.5px solid rgba(192,39,45,0.25);border-radius:50px;padding:8px 20px;">
        <span style="color:${C.crimson};font-weight:700;font-size:14px;">Order Cancelled</span>
      </div>
    </div>

    <h2 style="margin:0 0 4px;color:${C.brown};font-size:22px;">Hi ${firstName},</h2>
    <p style="margin:0 0 20px;color:${C.grey};font-size:15px;line-height:1.6;">
      Your order <strong>${orderNumber}</strong> has been cancelled. We're sorry to see it go!
    </p>

    ${isPrepaid && totalRs > 0 ? `
    <div style="background:rgba(46,125,50,0.06);border-radius:12px;padding:16px 20px;border:1px solid rgba(46,125,50,0.2);margin-bottom:20px;">
      <p style="margin:0;font-size:14px;color:#2E7D32;font-weight:600;">
        💰 Refund of ₹${totalRs} will be processed in 2–3 working days to your original payment method.
      </p>
    </div>` : `
    <div style="background:${C.lightBg};border-radius:12px;padding:16px 20px;border:1px solid rgba(200,150,12,0.2);margin-bottom:20px;">
      <p style="margin:0;font-size:14px;color:${C.brown};">
        No payment was charged for this order.
      </p>
    </div>`}

    <p style="margin:0;font-size:14px;color:${C.grey};line-height:1.6;">
      If you have any questions or this was a mistake, please WhatsApp us at
      <a href="https://wa.me/919701452929" style="color:${C.crimson};font-weight:700;text-decoration:none;">+91 97014 52929</a>
      and we'll sort it out right away.
    </p>

    ${btn("Browse Our Pickles →", `${SITE}/products`)}
  `);

  await send(to, `Order Cancelled — ${orderNumber} | Maa Flavours`, html);
}

// ─── Restock notification email ───────────────────────────────────────────────
export async function sendRestockEmail({
  to,
  productName,
  productSlug,
}: {
  to:          string;
  productName: string;
  productSlug: string;
}): Promise<void> {
  const productUrl = `${SITE}/products/${productSlug}`;

  const html = shell(`
    <h2 style="margin:0 0 8px;font-size:22px;color:${C.brown};font-family:Georgia,serif;">
      🎉 Great news — ${productName} is back!
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:${C.grey};line-height:1.6;">
      You asked us to let you know when <strong style="color:${C.brown};">${productName}</strong>
      was back in stock. It's available now — grab yours before it sells out again!
    </p>

    <div style="background:${C.lightBg};border-radius:12px;padding:20px 24px;border:1px solid rgba(200,150,12,0.2);margin-bottom:24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">🫙</div>
      <div style="font-size:18px;font-weight:700;color:${C.brown};">${productName}</div>
      <div style="font-size:13px;color:${C.grey};margin-top:4px;">Freshly made · No preservatives · Ships across India</div>
    </div>

    ${btn(`Order ${productName} Now →`, productUrl)}

    <p style="margin:24px 0 0;font-size:13px;color:${C.grey};text-align:center;line-height:1.6;">
      Stock is limited — we make these in small batches at home.<br/>
      Questions? WhatsApp us at
      <a href="https://wa.me/919701452929" style="color:${C.crimson};font-weight:700;text-decoration:none;">+91 97014 52929</a>
    </p>
  `);

  await send(to, `${productName} is back in stock! 🎉 | Maa Flavours`, html);
}
