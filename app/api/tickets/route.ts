import { NextResponse } from "next/server";
import { createTicket } from "../../../lib/ticket";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, ticketType, paymentMethod } = body ?? {};

    if (!name || !email || !ticketType || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ticket = createTicket({ name, email, ticketType, paymentMethod });

    return NextResponse.json(
      {
        ticketId: ticket.ticketId,
        ticket,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}