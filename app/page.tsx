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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Please fill in name and email.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, ticketType, paymentMethod }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create ticket");
      }

      const data = await res.json();
      setTicket(data.ticket as Ticket); // store the actual ticket object
    } catch (err: any) {
      setError(err.message || "Something went wrong");
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
        padding: "32px",
        background:
          "radial-gradient(circle at 10% 20%, #1e0b36 0%, #050816 40%, #190034 80%)",
        color: "#fff",
      }}
    >
      <div style={{ display: "flex", gap: 60, maxWidth: 980, width: "100%" }}>
        {/* LEFT SIDE */}
        <div style={{ flex: 1, maxWidth: 560 }}>
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(15,23,42,0.7)",
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Freedom Wave 2025
          </div>
          <h1
            style={{
              fontSize: 54,
              fontWeight: 800,
              lineHeight: 1.05,
              marginBottom: 18,
              color: "#FFD700",
            }}
          >
            Concert of Your Life
          </h1>
          <p style={{ fontSize: 20, opacity: 0.9, maxWidth: 520 }}>
            Come experience the concert of your life — lights, bass, and pure
            energy all night long. Grab your ticket and lock in your spot.
          </p>
        </div>

        {/* RIGHT SIDE: FORM + TICKET */}
        <div
          style={{
            width: 380,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 16,
            padding: 22,
            border: "1px solid rgba(148,163,184,0.3)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
          }}
        >
          <h2 style={{ marginBottom: 14, textAlign: "center" }}>
            🎫 Grab Your Spot
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              style={input}
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              style={input}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select
              style={input}
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
            >
              <option>Regular $100</option>
              <option>VIP $200</option>
              <option>VVIP $300</option>
            </select>
            <select
              style={input}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option>Credit / Debit Card</option>
              <option>PayPal</option>
              <option>Mobile Money</option>
            </select>

            <button type="submit" style={button} disabled={loading}>
              {loading ? "Generating..." : "Generate Ticket"}
            </button>
          </form>

          {error && (
            <p style={{ marginTop: 10, fontSize: 13, color: "#f97373" }}>
              {error}
            </p>
          )}

          {ticket && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, marginBottom: 8, opacity: 0.9 }}>
                Ticket created for{" "}
                <span style={{ fontWeight: 700 }}>{ticket.name}</span>. Scan the
                QR at the gate to verify.
              </p>

              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  padding: 16,
                  borderRadius: 18,
                  background:
                    "linear-gradient(135deg, rgba(91,33,182,0.95), rgba(236,72,153,0.85))",
                }}
              >
                <div style={{ maxWidth: 200 }}>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      opacity: 0.85,
                      marginBottom: 4,
                    }}
                  >
                    Freedom Wave
                  </div>
                  <div style={{ fontWeight: 700 }}>{ticket.ticketType} Pass</div>
                  <div
                    style={{
                      fontSize: 12,
                      marginTop: 8,
                      opacity: 0.9,
                    }}
                  >
                    {ticket.name}
                    <br />
                    ID: {ticket.ticketId}
                    <br />
                    Payment: {ticket.paymentMethod}
                  </div>
                </div>

                {qrValue && (
                  <div
                    style={{
                      background: "#fff",
                      padding: 8,
                      borderRadius: 14,
                    }}
                  >
                    <QRCode value={qrValue} size={96} />
                  </div>
                )}
              </div>

              {verifyUrl && (
                <p style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>
                  Verify URL:{" "}
                  <span style={{ fontFamily: "monospace" }}>{verifyUrl}</span>
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
  padding: "10px 11px",
  borderRadius: 8,
  border: "1px solid rgba(148,163,184,0.7)",
  marginBottom: 10,
  fontSize: 14,
  background: "rgba(15,23,42,0.6)",
  color: "#fff",
} as const;

const button = {
  width: "100%",
  padding: 11,
  borderRadius: 8,
  border: "none",
  marginTop: 4,
  background: "linear-gradient(135deg, #7c3aed, #ec4899)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
} as const;