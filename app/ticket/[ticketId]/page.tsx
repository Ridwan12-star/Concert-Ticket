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
    <div className="min-h-screen flex items-center justify-center bg-zinc-100">
      <main className="w-full max-w-md rounded-xl bg-white p-8 shadow space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Your Concert Ticket</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Show this QR code at the entrance. First scan will mark it as used.
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {ticketType}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Ticket ID: {ticketId}</p>
        </div>

        <div className="flex justify-center">
          <div className="rounded-lg bg-white p-4 shadow-inner">
            <QRCode value={verifyUrl} size={190} />
          </div>
        </div>

        <p className="text-xs text-zinc-500 break-all">
          QR opens: <span className="font-mono">{verifyUrl}</span>
        </p>
      </main>
    </div>
  );
}

