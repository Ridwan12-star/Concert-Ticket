"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import type { Ticket } from "@/lib/ticket";

export default function HomePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ticketType, setTicketType] = useState("Regular $100");
  const [paymentMethod, setPaymentMethod] = useState("Credit / Debit Card");
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setError("Please enter a valid name (at least 2 characters).");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!ticketType || !paymentMethod) {
      setError("Please select ticket type and payment method.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: trimmedName, 
          email: trimmedEmail, 
          ticketType, 
          paymentMethod 
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create ticket");
      }

      const data = await res.json();
      setTicket(data.ticket as Ticket);
      
      // Scroll to ticket section
      setTimeout(() => {
        const ticketElement = document.querySelector('[data-ticket-section]');
        ticketElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      console.error("Ticket creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyUrl =
    ticket && `/verify?ticketId=${encodeURIComponent(ticket.ticketId)}`;

  const qrValue =
    ticket &&
    (typeof window !== "undefined" && verifyUrl
      ? `${window.location.origin}${verifyUrl}`
      : ticket.ticketId);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(16px, 4vw, 32px)",
        background:
          "radial-gradient(circle at 10% 20%, #1e0b36 0%, #050816 40%, #190034 80%)",
        color: "#fff",
      }}
    >
      <div 
        style={{ 
          display: "flex", 
          flexDirection: "column",
          gap: "clamp(32px, 8vw, 60px)", 
          maxWidth: 980, 
          width: "100%"
        }}
      >
        {/* LEFT SIDE */}
        <div style={{ flex: 1, maxWidth: "100%" }}>
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(15,23,42,0.7)",
              fontSize: "clamp(10px, 2.5vw, 12px)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Freedom Wave 2025
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 8vw, 54px)",
              fontWeight: 800,
              lineHeight: 1.05,
              marginBottom: 18,
              color: "#FFD700",
            }}
          >
            Concert of Your Life
          </h1>
          <p style={{ 
            fontSize: "clamp(16px, 4vw, 20px)", 
            opacity: 0.9, 
            maxWidth: "100%",
            lineHeight: 1.6
          }}>
            Come experience the concert of your life — lights, bass, and pure
            energy all night long. Grab your ticket and lock in your spot.
          </p>
        </div>

        {/* RIGHT SIDE: FORM + TICKET */}
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            margin: "0 auto",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 16,
            padding: "clamp(18px, 4vw, 22px)",
            border: "1px solid rgba(148,163,184,0.3)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
          }}
        >
          <h2 style={{ 
            marginBottom: 14, 
            textAlign: "center",
            fontSize: "clamp(18px, 4vw, 22px)"
          }}>
            🎫 Grab Your Spot
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              style={input}
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              disabled={loading}
            />
            <input
              style={input}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={100}
              disabled={loading}
            />
            <select
              style={input}
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
              required
              disabled={loading}
            >
              <option>Regular $100</option>
              <option>VIP $200</option>
              <option>VVIP $300</option>
            </select>
            <select
              style={input}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
              disabled={loading}
            >
              <option>Credit / Debit Card</option>
              <option>PayPal</option>
              <option>Mobile Money</option>
            </select>

            <button 
              type="submit" 
              style={{
                ...button,
                fontSize: "clamp(14px, 3.5vw, 16px)",
                padding: "clamp(12px, 3vw, 14px)",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }} 
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Ticket"}
            </button>
          </form>

          {error && (
            <div 
              style={{ 
                marginTop: 12, 
                padding: 12,
                borderRadius: 8,
                background: "rgba(249, 115, 115, 0.1)",
                border: "1px solid rgba(249, 115, 115, 0.3)"
              }}
            >
              <p style={{ fontSize: "clamp(12px, 3vw, 13px)", color: "#f97373", margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          {ticket && (
            <div style={{ marginTop: 20 }} data-ticket-section>
              <div
                style={{
                  marginBottom: 12,
                  padding: 12,
                  borderRadius: 8,
                  background: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.3)"
                }}
              >
                <p style={{ 
                  fontSize: "clamp(12px, 3vw, 13px)", 
                  margin: 0,
                  color: "#4ade80",
                  lineHeight: 1.5
                }}>
                  ✅ Ticket created for{" "}
                  <span style={{ fontWeight: 700 }}>{ticket.name}</span>. 
                  Scan the QR at the gate to verify.
                </p>
              </div>

              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  padding: "clamp(14px, 3.5vw, 16px)",
                  borderRadius: 18,
                  background:
                    "linear-gradient(135deg, rgba(91,33,182,0.95), rgba(236,72,153,0.85))",
                }}
              >
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      fontSize: "clamp(10px, 2.5vw, 11px)",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      opacity: 0.85,
                      marginBottom: 4,
                    }}
                  >
                    Freedom Wave
                  </div>
                  <div style={{ 
                    fontWeight: 700,
                    fontSize: "clamp(14px, 3.5vw, 16px)",
                    marginBottom: 8
                  }}>
                    {ticket.ticketType} Pass
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(11px, 2.75vw, 12px)",
                      marginTop: 8,
                      opacity: 0.9,
                      lineHeight: 1.6,
                    }}
                  >
                    <div><strong>Name:</strong> {ticket.name}</div>
                    <div><strong>ID:</strong> {ticket.ticketId}</div>
                    <div><strong>Payment:</strong> {ticket.paymentMethod}</div>
                  </div>
                </div>

                {qrValue && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      background: "#fff",
                      padding: "clamp(10px, 2.5vw, 12px)",
                      borderRadius: 14,
                      alignSelf: "center",
                    }}
                  >
                    <QRCode 
                      value={qrValue} 
                      size={100}
                    />
                  </div>
                )}
              </div>

              {verifyUrl && (
                <p style={{ 
                  marginTop: 12, 
                  fontSize: "clamp(11px, 2.75vw, 12px)", 
                  opacity: 0.85,
                  wordBreak: "break-all",
                  lineHeight: 1.5
                }}>
                  Verify URL:{" "}
                  <span style={{ fontFamily: "monospace", fontSize: "clamp(10px, 2.5vw, 11px)" }}>
                    {verifyUrl}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const input = {
  width: "100%",
  padding: "clamp(10px, 2.5vw, 12px) clamp(11px, 2.75vw, 14px)",
  borderRadius: 8,
  border: "1px solid rgba(148,163,184,0.7)",
  marginBottom: 10,
  fontSize: "clamp(14px, 3.5vw, 16px)",
  background: "rgba(15,23,42,0.6)",
  color: "#fff",
  boxSizing: "border-box" as const,
  WebkitAppearance: "none" as const,
  touchAction: "manipulation" as const,
} as const;

const button = {
  width: "100%",
  padding: "clamp(11px, 2.75vw, 14px)",
  borderRadius: 8,
  border: "none",
  marginTop: 4,
  background: "linear-gradient(135deg, #7c3aed, #ec4899)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "clamp(14px, 3.5vw, 16px)",
  touchAction: "manipulation" as const,
  WebkitTapHighlightColor: "transparent" as const,
  transition: "opacity 0.2s, transform 0.1s" as const,
} as const;