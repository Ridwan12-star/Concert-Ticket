"use client";

import { useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function ScanPage() {
  const router = useRouter();
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastProcessedRef = useRef<string | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDecode = useCallback(
    (result: string) => {
      if (!result || isProcessing) return;

      // Prevent duplicate processing of the same code within 2 seconds
      const trimmedResult = result.trim();
      if (lastProcessedRef.current === trimmedResult) {
        return;
      }

      setIsProcessing(true);
      setLastResult(trimmedResult);
      setError(null);
      lastProcessedRef.current = trimmedResult;

      // Clear any existing timeout
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }

      try {
        // If QR encodes a path like "/verify?ticketId=..."
        if (trimmedResult.startsWith("/")) {
          router.push(trimmedResult);
          return;
        }

        // If QR encodes a full URL like "https://site.com/verify?ticketId=..."
        try {
          const url = new URL(trimmedResult);
          const pathAndQuery = url.pathname + url.search;
          router.push(pathAndQuery || "/");
          return;
        } catch {
          // Not a full URL, fall through
        }

        // If QR encodes just a ticketId, build the verify URL
        if (trimmedResult) {
          router.push(`/verify?ticketId=${encodeURIComponent(trimmedResult)}`);
        }
      } catch (e) {
        setError("Failed to handle scanned code. Please try again.");
        console.error("Scan decode error:", e);
        setIsProcessing(false);
      }

      // Reset processing state after 2 seconds to allow new scans
      processingTimeoutRef.current = setTimeout(() => {
        setIsProcessing(false);
        lastProcessedRef.current = null;
      }, 2000);
    },
    [router, isProcessing]
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(16px, 4vw, 24px)",
        background:
          "radial-gradient(circle at 10% 20%, #020617 0%, #020617 40%, #0b1120 80%)",
        color: "#e5e7eb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(15,23,42,0.9)",
          borderRadius: 18,
          padding: "clamp(16px, 4vw, 20px)",
          border: "1px solid rgba(148,163,184,0.6)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.7)",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(20px, 5vw, 22px)",
            fontWeight: 600,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Scan Ticket QR
        </h1>
        <p
          style={{
            fontSize: "clamp(12px, 3vw, 13px)",
            textAlign: "center",
            opacity: 0.8,
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          Point your camera at the ticket QR code. You&apos;ll be redirected to the
          verification screen automatically.
        </p>

        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(148,163,184,0.8)",
            background: "#020617",
            position: "relative",
            width: "100%",
          }}
        >
          <Scanner
            onScan={(results: any) => {
              if (isProcessing) return; // Skip if already processing
              const text = results?.[0]?.rawValue ?? results?.[0]?.text ?? "";
              if (typeof text === "string" && text.trim()) {
                handleDecode(text.trim());
              }
            }}
            onError={(err) => {
              console.error("Scanner error:", err);
              setError("Camera error. Please check camera permissions and try again.");
            }}
            constraints={{
              facingMode: "environment",
            }}
            styles={{
              container: { 
                width: "100%", 
                aspectRatio: "4 / 3",
                minHeight: "240px",
              },
              video: { 
                width: "100%", 
                height: "100%",
                objectFit: "cover" 
              },
            }}
          />
          
          {isProcessing && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0, 0, 0, 0.7)",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                zIndex: 10,
              }}
            >
              Processing...
            </div>
          )}
        </div>

        {lastResult && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 8,
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <p
              style={{
                fontSize: "clamp(11px, 2.75vw, 12px)",
                opacity: 0.9,
                margin: 0,
                wordBreak: "break-all",
                lineHeight: 1.5,
              }}
            >
              <strong>Last scanned:</strong>{" "}
              <span style={{ fontFamily: "monospace", fontSize: "clamp(10px, 2.5vw, 11px)" }}>
                {lastResult}
              </span>
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 8,
              background: "rgba(249, 115, 115, 0.1)",
              border: "1px solid rgba(249, 115, 115, 0.3)",
            }}
          >
            <p style={{ 
              margin: 0,
              fontSize: "clamp(11px, 2.75vw, 12px)", 
              color: "#f97373",
              lineHeight: 1.5
            }}>
              {error}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}


