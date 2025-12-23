import { NextResponse } from "next/server";
import { verifyAndUseTicket, checkTicket } from "@/lib/ticket";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, action } = body ?? {};

    // Validate input
    if (!ticketId || typeof ticketId !== "string") {
      return NextResponse.json(
        { error: "ticketId is required and must be a string" },
        { status: 400 }
      );
    }

    // Sanitize ticketId (prevent injection)
    const sanitizedTicketId = ticketId.trim().toUpperCase();

    // If action is "check", only check status without marking as used
    if (action === "check") {
      const result = checkTicket(sanitizedTicketId);
      return NextResponse.json(result, { status: 200 });
    }

    // Default action: verify and redeem (mark as used if valid)
    const result = verifyAndUseTicket(sanitizedTicketId);

    // Handle error status
    if (result.status === "error") {
      return NextResponse.json(
        { error: result.error || "Failed to verify ticket" },
        { status: 500 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Ticket verification error:", err);
    return NextResponse.json(
      { error: "Failed to verify ticket", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

