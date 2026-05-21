-- Migration 007: Add manual-order payment method values to payment_method_enum
-- These are needed for the Admin → New Manual Order form (WhatsApp/phone/cash orders).
-- 'upi'           — GPay, PhonePe, Paytm, any UPI app
-- 'cash'          — cash in hand / walk-in
-- 'whatsapp_pay'  — WhatsApp Pay
-- 'bank_transfer' — NEFT / IMPS / direct bank transfer

ALTER TYPE payment_method_enum ADD VALUE IF NOT EXISTS 'upi';
ALTER TYPE payment_method_enum ADD VALUE IF NOT EXISTS 'cash';
ALTER TYPE payment_method_enum ADD VALUE IF NOT EXISTS 'whatsapp_pay';
ALTER TYPE payment_method_enum ADD VALUE IF NOT EXISTS 'bank_transfer';
