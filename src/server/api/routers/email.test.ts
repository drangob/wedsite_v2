import { describe, it, vi, expect } from "vitest";
import { type inferProcedureInput } from "@trpc/server";
import { createCaller, type AppRouter } from "../root";
import { createTRPCContext } from "../trpc";

const mockMailgunMessageCreate = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ id: "test-message-id" }),
);

vi.mock("@/server/auth", () => ({
  getServerAuthSession: vi.fn().mockResolvedValue({
    user: {
      role: "ADMIN",
    },
  }),
}));

vi.mock("mailgun.js", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      client: vi.fn().mockReturnValue({
        messages: {
          create: mockMailgunMessageCreate,
        },
      }),
    })),
  };
});

vi.mock("@/server/db", async () => {
  const actual = await vi.importActual("@/server/db");
  return {
    db: {
      user: {
        findMany: vi.fn(() =>
          Promise.resolve([{ email: "guest@example.com" }]),
        ),
      },
    },
    UserRole: actual.UserRole,
  };
});

describe("email", () => {
  it("sends email to all guests", async () => {
    const ctx = await createTRPCContext({});
    const caller = createCaller(ctx);
    const input: inferProcedureInput<
      AppRouter["email"]["sendEmailToAllGuests"]
    > = { subject: "Test subject", body: "Test body" };

    const result = await caller.email.sendEmailToAllGuests(input);
    expect(result).toEqual({ success: true, messageId: "test-message-id" });

    expect(mockMailgunMessageCreate).toHaveBeenCalledWith(
      "fake_mailgun_domain",
      {
        from: "Fake Sender <fake_mailgun_sender_email@example.com>",
        html: "Test body",
        subject: "Test subject",
        to: ["guest@example.com"],
      },
    );
  });
});
