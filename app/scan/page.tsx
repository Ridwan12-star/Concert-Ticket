"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function ScanPage() {
  const router = useRouter();
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = useCallback(
    (result: string) => {
      if (!result) return;

      setLastResult(result);
      setError(null);

      try {
        // If QR encodes a path like "/verify?ticketId=..."
        if (result.startsWith("/")) {
          router.push(result);
          return;
        }

        // If QR encodes a full URL like "https://site.com/verify?ticketId=..."
        try {
          const url = new URL(result);
          const pathAndQuery = url.pathname + url.search;
          router.push(pathAndQuery || "/");
          return;
        } catch {
          // Not a full URL, fall through
        }

        // If QR encodes just a ticketId, build the verify URL
        const maybeTicketId = result.trim();
        if (maybeTicketId) {
          router.push(`/verify?ticketId=${encodeURIComponent(maybeTicketId)}`);
        }
      } catch (e) {
        setError("Failed to handle scanned code. Try again.");
        console.error(e);
      }
    },
    [router]
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "radial-gradient(circle at 10% 20%, #020617 0%, #020617 40%, #0b1120 80%)",
        color: "#e5e7eb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(15,23,42,0.9)",
          borderRadius: 18,
          padding: 20,
          border: "1px solid rgba(148,163,184,0.6)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.7)",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Scan Ticket QR
        </h1>
        <p
          style={{
            fontSize: 13,
            textAlign: "center",
            opacity: 0.8,
            marginBottom: 16,
          }}
        >
          Point your camera at the ticket QR. You&apos;ll be redirected to the
          verification screen automatically.
        </p>

        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(148,163,184,0.8)",
            background: "#020617",
          }}
        >
          <Scanner
            onDecode={handleDecode}
            onError={(err) => {
              console.error(err);
              setError("Camera error. Check permissions and try again.");
            }}
            constraints={{
              facingMode: "environment",
            }}
            containerStyle={{
              width: "100%",
              aspectRatio: "4 / 3",
            }}
          />
        </div>

        {lastResult && (
          <p
            style={{
              marginTop: 10,
              fontSize: 12,
              opacity: 0.85,
              wordBreak: "break-all",
            }}
          >
            Last scanned:{" "}
            <span style={{ fontFamily: "monospace" }}>{lastResult}</span>
          </p>
        )}

        {error && (
          <p style={{ marginTop: 10, fontSize: 12, color: "#f97373" }}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
}


