// lib/tickets.ts

export type TicketStatus = "issued" | "used";

export type Ticket = {
  ticketId: string;
  name: string;
  email: string;
  ticketType: string;
  paymentMethod: string;
  status: TicketStatus;
  issuedAt: string;
  usedAt?: string;
};

// In‑memory store (demo only – replace with real DB later)
export const tickets = new Map<string, Ticket>();

export function createTicket(data: {
  name: string;
  email: string;
  ticketType: string;
  paymentMethod: string;
}) {
  const ticketId =
    "SW-" + Math.random().toString(36).substring(2, 9).toUpperCase();

  const ticket: Ticket = {
    ticketId,
    name: data.name,
    email: data.email,
    ticketType: data.ticketType,
    paymentMethod: data.paymentMethod,
    status: "issued",
    issuedAt: new Date().toISOString(),
  };

  tickets.set(ticketId, ticket);
  return ticket;
}

export function verifyAndUseTicket(ticketId: string) {
  const ticket = tickets.get(ticketId);
  if (!ticket) return { status: "invalid" as const };

  if (ticket.status === "used") {
    return { status: "used" as const, ticket };
  }

  ticket.status = "used";
  ticket.usedAt = new Date().toISOString();
  tickets.set(ticketId, ticket);

  return { status: "valid" as const, ticket };
}