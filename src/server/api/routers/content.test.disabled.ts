/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, it, vi, expect } from "vitest";
import { type inferProcedureInput } from "@trpc/server";
import { createCaller, type AppRouter } from "../root";
import { createTRPCContext } from "../trpc";
import { db } from "@/server/db";

// Mock the database
vi.mock("@/server/db", async () => {
  const actual = await vi.importActual("@/server/db");
  return {
    db: {
      content: {
        findMany: vi.fn(() => Promise.resolve([{ slug: "test-slug" }])),
        findFirst: vi.fn(() =>
          Promise.resolve({
            id: "1",
            slug: "test-slug",
            html: "<p>Test content</p>",
          }),
        ),
        create: vi.fn((data) => Promise.resolve({ id: "2", ...data.data })),
        update: vi.fn((data) =>
          Promise.resolve({ id: data.where.id, ...data.data }),
        ),
        delete: vi.fn(() => Promise.resolve()),
      },
      user: {
        findUnique: vi.fn(() => Promise.resolve({ id: "user1" })),
      },
    },
    UserRole: actual.UserRole,
  };
});

// Mock authentication
vi.mock("@/server/auth", () => ({
  getServerAuthSession: vi.fn().mockResolvedValue({
    user: {
      role: "ADMIN",
      email: "admin@example.com",
    },
  }),
}));

describe("content router", () => {
  it("gets all content slugs", async () => {
    const ctx = await createTRPCContext({});
    const caller = createCaller(ctx);

    const result = await caller.content.getAllContentInfo();
    expect(result).toEqual(["test-slug"]);
    expect(vi.mocked(db.content.findMany)).toHaveBeenCalledWith({
      select: { slug: true },
    });
  });

  it("gets content by slug", async () => {
    const ctx = await createTRPCContext({});
    const caller = createCaller(ctx);
    const input: inferProcedureInput<AppRouter["content"]["getContentBySlug"]> =
      { slug: "test-slug" };

    const result = await caller.content.getContentBySlug(input);
    expect(result).toEqual({
      id: "1",
      slug: "test-slug",
      html: "<p>Test content</p>",
    });
    expect(vi.mocked(db.content.findFirst)).toHaveBeenCalledWith({
      where: { slug: "test-slug" },
    });
  });

  it("creates new content", async () => {
    const ctx = await createTRPCContext({});
    const caller = createCaller(ctx);
    const input: inferProcedureInput<AppRouter["content"]["createContent"]> = {
      slug: "new-slug",
    };

    const result = await caller.content.createContent(input);
    expect(result).toEqual({ id: "2", slug: "new-slug", html: "" });
    expect(vi.mocked(db.content.create)).toHaveBeenCalledWith({
      data: {
        slug: "new-slug",
        html: "",
        updatedByUserId: "user1",
      },
    });
    expect(vi.mocked(db.user.findUnique)).toHaveBeenCalledWith({
      where: { email: "admin@example.com" },
      select: { id: true },
    });
  });

  it("updates existing content", async () => {
    const ctx = await createTRPCContext({});
    const caller = createCaller(ctx);
    const input: inferProcedureInput<AppRouter["content"]["updateContent"]> = {
      id: "1",
      slug: "updated-slug",
      html: "<p>Updated content</p>",
    };

    const result = await caller.content.updateContent(input);
    expect(result).toEqual({
      id: "1",
      slug: "updated-slug",
      html: "<p>Updated content</p>",
    });
    expect(vi.mocked(db.content.update)).toHaveBeenCalledWith({
      where: { id: "1" },
      data: {
        slug: "updated-slug",
        html: "<p>Updated content</p>",
        updatedByUserId: "user1",
      },
    });
    expect(vi.mocked(db.user.findUnique)).toHaveBeenCalledWith({
      where: { email: "admin@example.com" },
      select: { id: true },
    });
  });

  it("deletes content", async () => {
    const ctx = await createTRPCContext({});
    const caller = createCaller(ctx);
    const input: inferProcedureInput<AppRouter["content"]["deleteContent"]> = {
      slug: "test-slug",
    };

    const result = await caller.content.deleteContent(input);
    expect(result).toBe(true);
    expect(vi.mocked(db.content.delete)).toHaveBeenCalledWith({
      where: { slug: "test-slug" },
    });
  });
});
