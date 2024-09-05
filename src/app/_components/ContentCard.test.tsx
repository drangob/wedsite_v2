import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ContentCard from "./ContentCard";

import { api } from "@/trpc/react";

// Mock the api
vi.mock("@/trpc/react", () => ({
  api: {
    content: {
      getContentBySlug: {
        useQuery: vi.fn(),
      },
    },
  },
}));

describe("ContentCard", () => {
  it("renders loading spinner when data is not available", () => {
    // @ts-expect-error - Mocking API
    vi.mocked(api.content.getContentBySlug.useQuery).mockReturnValue({
      data: undefined,
      error: null,
    });

    render(<ContentCard slug="test-slug" />);
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("renders content when data is available", () => {
    const testHtml = "<p>Test content</p>";
    // @ts-expect-error - Mocking API
    vi.mocked(api.content.getContentBySlug.useQuery).mockReturnValue({
      data: { html: testHtml },
      error: null,
    });

    render(<ContentCard slug="test-slug" />);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders error message when there is an error", () => {
    vi.mocked(api.content.getContentBySlug.useQuery).mockReturnValue({
      data: undefined,
      // @ts-expect-error - Mocking API
      error: "error",
    });

    render(<ContentCard slug="test-slug" />);
    expect(
      screen.getByText("Error loading content 'test-slug'"),
    ).toBeInTheDocument();
  });

  it("passes additional props to Card component", () => {
    // @ts-expect-error - Mocking API
    vi.mocked(api.content.getContentBySlug.useQuery).mockReturnValue({
      data: { html: "<p>Test</p>" },
      error: null,
    });

    render(<ContentCard slug="test-slug" className="test-class" />);
    expect(screen.getByText("Test").closest(".test-class")).toBeInTheDocument();
  });
});
