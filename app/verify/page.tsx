"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";


import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyStatus = "idle" | "checking" | "valid" | "used" | "invalid";

export default function VerifyPage() {
  const params = useSearchParams();
  const [ticketId, setTicketId] = useState("");
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fromUrl = params.get("ticketId");
    if (fromUrl) {
      setTicketId(fromUrl);
      void checkTicket(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;
    await checkTicket(ticketId.trim());
  };

  const checkTicket = async (id: string) => {
    setStatus("checking");
    setMessage("");

    try {
      const res = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: id }),
      });
      const data = await res.json();

      if (data.status === "valid") {
        setStatus("valid");
        setMessage("Ticket is VALID and not used. Let them in.");
      } else if (data.status === "used") {
        setStatus("used");
        setMessage("Ticket has ALREADY BEEN USED. Do NOT admit.");
      } else if (data.status === "invalid") {
        setStatus("invalid");
        setMessage("Ticket ID is NOT RECOGNISED for this event.");
      } else {
        setStatus("invalid");
        setMessage("Unexpected response from server.");
      }
    } catch {
      setStatus("invalid");
      setMessage("Network or server error while verifying.");
    }
  };

  const color =
    status === "valid"
      ? "#4ade80"
      : status === "used"
      ? "#f97373"
      : status === "invalid"
      ? "#fb7185"
      : status === "checking"
      ? "#facc15"
      : "rgba(255,255,255,0.85)";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "radial-gradient(circle at 10% 20%, #1e0b36 0%, #050816 40%, #190034 80%)",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(15,23,42,0.82)",
          borderRadius: 18,
          padding: "24px 26px 26px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.65)",
          border: "1px solid rgba(148,163,184,0.35)",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
          Verify Ticket
        </h1>
        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 16 }}>
          Scan the QR or type the ticket ID below to confirm if it is valid and
          unused. First successful scan marks the ticket as used.
        </p>

        <form onSubmit={onSubmit}>
          <input
            style={{
              width: "100%",
              padding: "10px 11px",
              borderRadius: 8,
              border: "1px solid rgba(148,163,184,0.7)",
              marginBottom: 10,
              fontSize: 14,
              background: "rgba(15,23,42,0.6)",
              color: "#fff",
            }}
            placeholder="e.g. SW-ABC1234"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 11,
              borderRadius: 8,
              border: "none",
              marginTop: 4,
              background: "linear-gradient(135deg, #7c3aed, #ec4899)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {status === "checking" ? "Checking..." : "Verify Ticket"}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 13, color }}>{message}</p>
      </div>
    </main>
  );
}