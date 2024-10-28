import { describe, it, vi, expect } from "vitest";
import { createCaller } from "../root";
import { createTRPCContext } from "../trpc";

import { dbMock } from "@/server/setupTests";
import { faker } from "@faker-js/faker";

vi.mock("@/server/auth", () => ({
  getServerAuthSession: vi.fn().mockResolvedValue({
    user: {
      role: "ADMIN",
    },
  }),
}));

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
