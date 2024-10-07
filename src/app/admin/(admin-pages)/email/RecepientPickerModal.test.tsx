import { describe, it, expect, vi, type Mock, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import RecepientPickerModal from "./RecepientPickerModal";

// Mock the api
vi.mock("@/trpc/react", () => ({
  api: {
    user: {
      getAllGuests: {
        useQuery: vi.fn().mockReturnValue({
          data: [
            {
              id: "1",
              name: "John Doe",
              email: "john_doe@example.com",
              group: "DAY",
            },
            {
              id: "2",
              name: "Tim Apple",
              email: "tim_apple@example.com",
              group: "EVENING",
            },
            {
              id: "3",
              name: "Jane Doe",
              email: "jane_doe@example.com",
              group: "DAY",
            },
            {
              id: "4",
              name: "Bob Smith",
              email: "bob_smith@example.com",
              group: "EVENING",
            },
          ],
        }),
      },
    },
  },
}));

describe("RecepientPickerModal", () => {
  let onClose: Mock;
  let setTo: Mock;

  beforeEach(() => {
    onClose = vi.fn();
    setTo = vi.fn();
  });

  it("renders recepient picker correctly", () => {
    render(
      <RecepientPickerModal
        isOpen={true}
        onClose={onClose}
        setTo={setTo}
        to={[]}
      />,
    );
    expect(screen.getByText("Day Guests")).toBeInTheDocument();
    expect(screen.getByText("Evening Guests")).toBeInTheDocument();
  });
});
