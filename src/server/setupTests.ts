import { type PrismaClient } from "@prisma/client";
import { vi, beforeEach } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";

import { db } from "@/server/db";

vi.mock("@/server/db", async () => {
  const actual = await vi.importActual("@/server/db");
  return {
    db: mockDeep<PrismaClient>(),
    UserRole: actual.UserRole,
  };
});

beforeEach(() => {
  mockReset(db);
});

export const dbMock = db as DeepMockProxy<PrismaClient>;
