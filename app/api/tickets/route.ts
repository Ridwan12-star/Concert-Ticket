import { NextResponse } from "next/server";
import { createTicket } from "../../../lib/ticket";

// Input validation helpers
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input: string, maxLength: number = 200): string {
  return input.trim().slice(0, maxLength).replace(/[<>]/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, ticketType, paymentMethod } = body ?? {};

    // Validate required fields
    if (!name || !email || !ticketType || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, ticketType, and paymentMethod are required" },
        { status: 400 }
      );
    }

    // Validate and sanitize inputs
    const sanitizedName = sanitizeInput(String(name), 100);
    const sanitizedEmail = sanitizeInput(String(email), 100);
    const sanitizedTicketType = sanitizeInput(String(ticketType), 50);
    const sanitizedPaymentMethod = sanitizeInput(String(paymentMethod), 50);

    if (!sanitizedName || sanitizedName.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Validate ticket type (prevent injection)
    const allowedTicketTypes = ["Regular $100", "VIP $200", "VVIP $300"];
    if (!allowedTicketTypes.includes(sanitizedTicketType)) {
      return NextResponse.json(
        { error: "Invalid ticket type selected" },
        { status: 400 }
      );
    }

    // Validate payment method
    const allowedPaymentMethods = ["Credit / Debit Card", "PayPal", "Mobile Money"];
    if (!allowedPaymentMethods.includes(sanitizedPaymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method selected" },
        { status: 400 }
      );
    }

    const ticket = createTicket({ 
      name: sanitizedName, 
      email: sanitizedEmail, 
      ticketType: sanitizedTicketType, 
      paymentMethod: sanitizedPaymentMethod 
    });

    return NextResponse.json(
      {
        ticketId: ticket.ticketId,
        ticket,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Ticket creation error:", err);
    return NextResponse.json(
      { 
        error: "Failed to create ticket",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}