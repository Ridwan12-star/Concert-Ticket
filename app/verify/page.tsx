"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

type VerifyStatus = "idle" | "checking" | "valid" | "used" | "invalid" | "error";

interface TicketInfo {
  name?: string;
  ticketType?: string;
  usedAt?: string;
  scanHistory?: Array<{ scannedAt: string; action: string }>;
}

export default function VerifyPage() {
  const params = useSearchParams();
  const [ticketId, setTicketId] = useState("");
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [message, setMessage] = useState("");
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [redeemed, setRedeemed] = useState(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Only verify once on initial load if ticketId is in URL
    if (hasInitializedRef.current) return;
    
    const fromUrl = params.get("ticketId");
    if (fromUrl) {
      hasInitializedRef.current = true;
      setTicketId(fromUrl);
      void verifyTicket(fromUrl);
    }
  }, [params]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) {
      setStatus("error");
      setMessage("Please enter a ticket ID");
      return;
    }
    await verifyTicket(ticketId.trim());
  };

  const verifyTicket = async (id: string) => {
    setStatus("checking");
    setMessage("");
    setTicketInfo(null);
    setRedeemed(false);

    try {
      const res = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to verify ticket");
      }

      const data = await res.json();

      if (data.status === "valid") {
        setStatus("valid");
        setTicketInfo(data.ticket);
        if (data.redeemed) {
          setRedeemed(true);
          setMessage("✅ Ticket verified and REDEEMED. This ticket has been marked as used. Admit the guest.");
        } else {
          setMessage("✅ Ticket is VALID and ready to use. Click verify again to redeem.");
        }
      } else if (data.status === "used") {
        setStatus("used");
        setTicketInfo(data.ticket);
        const usedDate = data.ticket?.usedAt 
          ? new Date(data.ticket.usedAt).toLocaleString()
          : "previously";
        setMessage(`❌ Ticket has ALREADY BEEN USED (${usedDate}). Do NOT admit.`);
      } else if (data.status === "invalid") {
        setStatus("invalid");
        setMessage("❌ Ticket ID is NOT RECOGNISED for this event.");
      } else if (data.status === "error") {
        setStatus("error");
        setMessage(`⚠️ Error: ${data.error || "Unknown error occurred"}`);
      } else {
        setStatus("error");
        setMessage("⚠️ Unexpected response from server.");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(`❌ Network or server error: ${err.message || "Please try again"}`);
      console.error("Verification error:", err);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "valid":
        return redeemed ? "#4ade80" : "#22c55e";
      case "used":
        return "#f97373";
      case "invalid":
        return "#fb7185";
      case "checking":
        return "#facc15";
      case "error":
        return "#f59e0b";
      default:
        return "rgba(255,255,255,0.85)";
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case "valid":
        return redeemed 
          ? "rgba(34, 197, 94, 0.1)" 
          : "rgba(34, 197, 94, 0.1)";
      case "used":
        return "rgba(249, 115, 115, 0.1)";
      case "invalid":
        return "rgba(251, 113, 133, 0.1)";
      case "checking":
        return "rgba(250, 204, 21, 0.1)";
      case "error":
        return "rgba(245, 158, 11, 0.1)";
      default:
        return "transparent";
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background:
          "radial-gradient(circle at 10% 20%, #1e0b36 0%, #050816 40%, #190034 80%)",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "rgba(15,23,42,0.82)",
          borderRadius: 18,
          padding: "24px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.65)",
          border: "1px solid rgba(148,163,184,0.35)",
        }}
      >
        <h1 
          style={{ 
            fontSize: "clamp(20px, 5vw, 24px)", 
            fontWeight: 800, 
            marginBottom: 8 
          }}
        >
          Verify Ticket
        </h1>
        <p 
          style={{ 
            fontSize: "clamp(12px, 3vw, 13px)", 
            opacity: 0.8, 
            marginBottom: 20,
            lineHeight: 1.5
          }}
        >
          Scan the QR code or enter the ticket ID below. First successful verification will mark the ticket as used.
        </p>

        <form onSubmit={onSubmit}>
          <input
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid rgba(148,163,184,0.7)",
              marginBottom: 12,
              fontSize: 14,
              background: "rgba(15,23,42,0.6)",
              color: "#fff",
              boxSizing: "border-box",
            }}
            placeholder="e.g. SW-ABC1234"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value.toUpperCase())}
            disabled={status === "checking"}
            autoFocus
          />
          <button
            type="submit"
            disabled={status === "checking" || !ticketId.trim()}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "none",
              background: status === "checking" 
                ? "rgba(124, 58, 237, 0.5)" 
                : "linear-gradient(135deg, #7c3aed, #ec4899)",
              color: "#fff",
              fontWeight: 700,
              cursor: status === "checking" ? "not-allowed" : "pointer",
              fontSize: 14,
              transition: "opacity 0.2s",
              opacity: status === "checking" || !ticketId.trim() ? 0.6 : 1,
            }}
          >
            {status === "checking" ? "Verifying..." : "Verify & Redeem Ticket"}
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 12,
              background: getStatusBg(),
              border: `1px solid ${getStatusColor()}40`,
            }}
          >
            <p 
              style={{ 
                fontSize: "clamp(12px, 3vw, 14px)", 
                color: getStatusColor(),
                fontWeight: 500,
                lineHeight: 1.6,
                margin: 0
              }}
            >
              {message}
            </p>
            
            {ticketInfo && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <p style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
                  <strong>Ticket Details:</strong>
                </p>
                <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.8 }}>
                  {ticketInfo.name && <div>Name: {ticketInfo.name}</div>}
                  {ticketInfo.ticketType && <div>Type: {ticketInfo.ticketType}</div>}
                  {ticketInfo.usedAt && (
                    <div>Used At: {new Date(ticketInfo.usedAt).toLocaleString()}</div>
                  )}
                  {ticketInfo.scanHistory && ticketInfo.scanHistory.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>
                      Scan History: {ticketInfo.scanHistory.length} scan(s)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}