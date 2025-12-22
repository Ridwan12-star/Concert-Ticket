import { NextResponse } from "next/server";
import { verifyAndUseTicket } from "@/lib/ticket";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId } = body ?? {};

    if (!ticketId) {
      return NextResponse.json(
        { error: "ticketId is required" },
        { status: 400 }
      );
    }

    const result = verifyAndUseTicket(ticketId);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to verify ticket" },
      { status: 500 }
    );
  }
}

