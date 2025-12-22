"use client";

import { useParams, useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";

export default function TicketPage() {
  const params = useParams<{ ticketId: string }>();
  const searchParams = useSearchParams();

  const ticketId = params.ticketId;
  const name = searchParams.get("name") ?? "Guest";
  const ticketType = searchParams.get("ticketType") ?? "General Admission";

  const verifyUrl = `/verify?ticketId=${encodeURIComponent(ticketId)}`;

  return (
    <div 
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(16px, 4vw, 24px)",
        background:
          "radial-gradient(circle at 10% 20%, #1e0b36 0%, #050816 40%, #190034 80%)",
        color: "#fff",
      }}
    >
      <main 
        style={{
          width: "100%",
          maxWidth: "480px",
          borderRadius: 18,
          background: "rgba(15,23,42,0.82)",
          padding: "clamp(20px, 5vw, 32px)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.65)",
          border: "1px solid rgba(148,163,184,0.35)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(20px, 5vw, 24px)",
          textAlign: "center",
        }}
      >
        <div>
          <h1 
            style={{
              fontSize: "clamp(20px, 5vw, 24px)",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Your Concert Ticket
          </h1>
          <p 
            style={{
              marginTop: 8,
              fontSize: "clamp(12px, 3vw, 14px)",
              opacity: 0.8,
              lineHeight: 1.5,
            }}
          >
            Show this QR code at the entrance. First scan will mark it as used.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p 
            style={{
              fontSize: "clamp(14px, 3.5vw, 16px)",
              fontWeight: 600,
            }}
          >
            {name}
          </p>
          <p 
            style={{
              fontSize: "clamp(11px, 2.75vw, 12px)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              opacity: 0.7,
            }}
          >
            {ticketType}
          </p>
          <p 
            style={{
              marginTop: 8,
              fontSize: "clamp(11px, 2.75vw, 12px)",
              opacity: 0.6,
              fontFamily: "monospace",
            }}
          >
            Ticket ID: {ticketId}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div 
            style={{
              borderRadius: 12,
              background: "#fff",
              padding: "clamp(12px, 3vw, 16px)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <QRCode 
              value={verifyUrl} 
              size={180}
            />
          </div>
        </div>

        <p 
          style={{
            fontSize: "clamp(10px, 2.5vw, 12px)",
            opacity: 0.7,
            wordBreak: "break-all",
            lineHeight: 1.5,
          }}
        >
          QR opens:{" "}
          <span 
            style={{
              fontFamily: "monospace",
              fontSize: "clamp(9px, 2.25vw, 11px)",
            }}
          >
            {verifyUrl}
          </span>
        </p>
      </main>
    </div>
  );
}

