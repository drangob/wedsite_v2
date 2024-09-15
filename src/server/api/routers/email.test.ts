import { describe, it, vi, expect } from "vitest";
import { type inferProcedureInput } from "@trpc/server";
import { createCaller, type AppRouter } from "../root";
import { createTRPCContext } from "../trpc";

import { dbMock } from "@/server/setupTests";
import { faker } from "@faker-js/faker";

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

const getMockEmail = (sent: boolean) => ({
  id: `test-id-${faker.number.int()}`,
  from: faker.internet.email(),
  subject: faker.lorem.sentence(),
  body: faker.lorem.paragraph(),
  sentAt: sent ? faker.date.past() : null,
  createdAt: new Date(),
  updatedAt: new Date(),
  to: [{ id: "test-uid", email: "test-to", name: "test name", group: "DAY" }],
});

describe("email", () => {
  it("sends email to all guests", async () => {
    const ctx = await createTRPCContext({});
    const caller = createCaller(ctx);
    const input: inferProcedureInput<
      AppRouter["email"]["sendEmailToAllGuests"]
    > = { subject: "Test subject", body: "Test body" };

    // @ts-expect-error Partial definition of user for testing
    dbMock.user.findMany.mockResolvedValue([{ email: "guest@example.com" }]);

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

  it("gets all emails from the database", async () => {
    const ctx = await createTRPCContext({});
    const caller = createCaller(ctx);

    const sentEmail = getMockEmail(true);
    const unsentEmail = getMockEmail(false);

    dbMock.email.findMany.mockResolvedValue([sentEmail, unsentEmail]);

    const result = await caller.email.getAllEmails();

    expect(result.length).toBe(2);
    expect(result[0]?.id).toBe(sentEmail.id);
    expect(result[0]?.sent).toBe(true);
    expect(result[1]?.id).toBe(unsentEmail.id);
    expect(result[1]?.sent).toBe(false);
  });
});
