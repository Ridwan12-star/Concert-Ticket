// lib/ticket.ts

export type TicketStatus = "issued" | "used";

export type ScanHistory = {
  scannedAt: string;
  action: "checked" | "redeemed";
};

export type Ticket = {
  ticketId: string;
  name: string;
  email: string;
  ticketType: string;
  paymentMethod: string;
  status: TicketStatus;
  issuedAt: string;
  usedAt?: string;
  scanHistory?: ScanHistory[];
};

// In-memory store (demo only – replace with real DB later)
export const tickets = new Map<string, Ticket>();

// Lock mechanism to prevent race conditions
const ticketLocks = new Map<string, boolean>();

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
    scanHistory: [],
  };

  tickets.set(ticketId, ticket);
  return ticket;
}

/**
 * Check ticket status without modifying it
 */
export function checkTicket(ticketId: string) {
  const ticket = tickets.get(ticketId);
  if (!ticket) {
    return { status: "invalid" as const, ticket: null };
  }

  // Add scan history entry for check
  if (!ticket.scanHistory) {
    ticket.scanHistory = [];
  }
  ticket.scanHistory.push({
    scannedAt: new Date().toISOString(),
    action: "checked",
  });
  tickets.set(ticketId, ticket);

  if (ticket.status === "used") {
    return { status: "used" as const, ticket };
  }

  return { status: "valid" as const, ticket };
}

/**
 * Verify and redeem ticket (marks as used only if currently valid)
 * This is an atomic operation to prevent race conditions
 */
export function verifyAndUseTicket(ticketId: string) {
  // Check if ticket is locked (prevent concurrent modifications)
  if (ticketLocks.get(ticketId)) {
    // Wait a bit and retry (simple approach for in-memory store)
    return { status: "error" as const, error: "Ticket verification in progress" };
  }

  const ticket = tickets.get(ticketId);
  if (!ticket) {
    return { status: "invalid" as const, ticket: null };
  }

  // Lock the ticket
  ticketLocks.set(ticketId, true);

  try {
    // Double-check status after acquiring lock
    const currentTicket = tickets.get(ticketId);
    if (!currentTicket) {
      return { status: "invalid" as const, ticket: null };
    }

    // If already used, return used status
    if (currentTicket.status === "used") {
      // Add scan history entry
      if (!currentTicket.scanHistory) {
        currentTicket.scanHistory = [];
      }
      currentTicket.scanHistory.push({
        scannedAt: new Date().toISOString(),
        action: "checked",
      });
      tickets.set(ticketId, currentTicket);
      return { status: "used" as const, ticket: currentTicket };
    }

    // Mark as used (only if currently valid)
    currentTicket.status = "used";
    currentTicket.usedAt = new Date().toISOString();
    
    // Add scan history entry for redemption
    if (!currentTicket.scanHistory) {
      currentTicket.scanHistory = [];
    }
    currentTicket.scanHistory.push({
      scannedAt: new Date().toISOString(),
      action: "redeemed",
    });
    
    tickets.set(ticketId, currentTicket);

    // Return valid status (ticket was valid and is now redeemed)
    return { status: "valid" as const, ticket: currentTicket, redeemed: true };
  } finally {
    // Release lock after a short delay
    setTimeout(() => {
      ticketLocks.delete(ticketId);
    }, 100);
  }
}