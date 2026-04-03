"use client";
// src/app/account/profile/page.tsx
// Maa Flavours — Edit Profile Page
// Shows: mobile (read-only), name (editable), email (editable)
// Updates Supabase customers table via /api/auth/update-profile

import { useState, useEffect } from "react";
import { User, Mail, Phone, CheckCircle2, Edit3, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setMobile(user.mobile ? user.mobile.replace("+91", "") : "");
    }
  }, [user]);

  const handleSave = async () => {
    setNameError(""); setEmailError("");
    if (!name.trim() || name.trim().length < 2) {
      setNameError("Name must be at least 2 characters."); return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address."); return;
    }

    setMobileError("");
    if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
      setMobileError("Enter a valid 10-digit mobile number."); return;
    }

    setLoading(true);
    try {
      const mobileFull = mobile ? `+91${mobile}` : (user?.mobile || "");
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: mobileFull || undefined,
          name: name.trim(),
          email: email.trim() || user?.email || "",
        }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.error || "Failed to save"); return; }
      await refreshUser();
      setSaved(true);
      toast.success("Profile updated!");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to update profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="font-playfair font-bold text-xl" style={{ color: "var(--color-brown)" }}>Profile</h2>
        <p className="font-dm-sans text-sm mt-0.5" style={{ color: "var(--color-grey)" }}>
          Manage your account details
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)", boxShadow: "0 2px 12px rgba(74,44,10,0.05)" }}>
        <div className="h-[3px]" style={{
          background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
        }} />

        {/* Avatar row */}
        <div className="flex items-center gap-4 px-6 py-5 border-b" style={{ borderColor: "rgba(200,150,12,0.08)" }}>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-playfair font-bold text-2xl text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,var(--color-crimson) 0%,#8B1A1A 100%)" }}
          >
            {name.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-playfair font-bold text-lg" style={{ color: "var(--color-brown)" }}>
              {name || "Customer"}
            </p>
            <p className="font-dm-sans text-sm mt-0.5" style={{ color: "var(--color-grey)" }}>
              Member since {new Date().getFullYear()}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Mobile — read-only if already set, editable if empty */}
          <div>
            <label className="block font-dm-sans text-sm font-semibold mb-1.5" style={{ color: "var(--color-brown)" }}>
              Mobile Number
            </label>
            {user?.mobile ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                  style={{ background: "var(--color-cream)", border: "2px solid rgba(200,150,12,0.15)" }}>
                  <Phone size={16} style={{ color: "var(--color-grey)" }} />
                  <span className="font-dm-sans text-base flex-1" style={{ color: "var(--color-brown)", letterSpacing: "0.04em" }}>
                    {user.mobile}
                  </span>
                  <span className="font-dm-sans text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(46,125,50,0.1)", color: "#2E7D32" }}>
                    ✓ Verified
                  </span>
                </div>
                <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-grey)" }}>
                  Mobile number cannot be changed — it&apos;s your login credential
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center rounded-xl overflow-hidden"
                  style={{ border: `2px solid ${mobileError ? "#C0272D" : "rgba(200,150,12,0.25)"}` }}>
                  <span className="px-4 py-3.5 font-dm-sans text-sm font-medium select-none"
                    style={{ background: "var(--color-cream)", color: "var(--color-brown)", borderRight: "1px solid rgba(200,150,12,0.2)" }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={e => { setMobile(e.target.value.replace(/\D/g, "")); setMobileError(""); }}
                    className="flex-1 px-4 py-3.5 font-dm-sans text-base outline-none bg-white"
                    style={{ color: "var(--color-brown)" }}
                  />
                </div>
                {mobileError && <p className="font-dm-sans text-xs mt-1" style={{ color: "#C0272D" }}>{mobileError}</p>}
                <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-grey)" }}>
                  Add your mobile number for faster checkout
                </p>
              </>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="profile-name" className="block font-dm-sans text-sm font-semibold mb-1.5"
              style={{ color: "var(--color-brown)" }}>
              Full Name *
            </label>
            <div className="flex rounded-xl overflow-hidden"
              style={{ border: `2px solid ${nameError ? "var(--color-crimson)" : "rgba(200,150,12,0.25)"}` }}>
              <div className="flex items-center justify-center w-11 flex-shrink-0"
                style={{ background: "var(--color-cream)" }}>
                <User size={16} style={{ color: "var(--color-gold)" }} />
              </div>
              <input id="profile-name" type="text"
                value={name} onChange={(e) => { setName(e.target.value); setNameError(""); }}
                placeholder="Enter your full name"
                className="flex-1 px-3.5 py-3.5 font-dm-sans text-base bg-white outline-none"
                style={{ color: "var(--color-brown)" }} autoComplete="name" maxLength={80}
              />
              <div className="flex items-center pr-3">
                <Edit3 size={14} style={{ color: "var(--color-grey)", opacity: 0.5 }} />
              </div>
            </div>
            {nameError && (
              <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-crimson)" }}>⚠️ {nameError}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="profile-email" className="block font-dm-sans text-sm font-semibold mb-1.5"
              style={{ color: "var(--color-brown)" }}>
              Email Address{" "}
              <span className="font-normal" style={{ color: "var(--color-grey)" }}>(optional)</span>
            </label>
            <div className="flex rounded-xl overflow-hidden"
              style={{ border: `2px solid ${emailError ? "var(--color-crimson)" : "rgba(200,150,12,0.2)"}` }}>
              <div className="flex items-center justify-center w-11 flex-shrink-0"
                style={{ background: "var(--color-cream)" }}>
                <Mail size={16} style={{ color: "var(--color-gold)" }} />
              </div>
              <input id="profile-email" type="email"
                value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                placeholder="your@email.com"
                className="flex-1 px-3.5 py-3.5 font-dm-sans text-base bg-white outline-none"
                style={{ color: "var(--color-brown)" }} autoComplete="email"
              />
              <div className="flex items-center pr-3">
                <Edit3 size={14} style={{ color: "var(--color-grey)", opacity: 0.5 }} />
              </div>
            </div>
            {emailError && (
              <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-crimson)" }}>⚠️ {emailError}</p>
            )}
            <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-grey)" }}>
              For order receipts and exclusive pickle offers
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button onClick={handleSave} disabled={loading}
            className="btn-primary w-full py-3.5 text-base gap-2.5 disabled:opacity-60">
            {loading
              ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
              : saved
              ? <><CheckCircle2 size={18} />Saved!</>
              : <><Save size={18} />Save Changes</>
            }
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(192,39,45,0.15)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(192,39,45,0.1)" }}>
          <h3 className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>Account Actions</h3>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <div>
            <p className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-brown)" }}>Delete Account</p>
            <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
              Permanently delete your account and all data. This cannot be undone.
            </p>
            <button className="mt-2 font-dm-sans text-sm font-semibold underline hover:no-underline transition-opacity"
              style={{ color: "var(--color-crimson)" }}
              onClick={() => alert("Please contact maaflavours74@gmail.com to delete your account.")}>
              Request Account Deletion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
