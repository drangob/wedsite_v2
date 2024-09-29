import { describe, it, expect, vi, type Mock, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import EmailClient from "./EmailClient";

// mock debounce so we don't have to wait for the debounce time
vi.mock("use-debounce", () => ({
  useDebounce: (email: string, debounceTime: number) => [email, debounceTime],
}));

vi.mock("@/app/_hooks/useGuestsManagement", () => ({
  useGuestsManagement: vi.fn().mockReturnValue({
    guests: [],
  }),
}));

describe("EmailClient", () => {
  const mockEmail = {
    id: "2",
    subject: "Test Email 2",
    body: "Some body text",
    updatedAt: new Date(),
    sent: false,
  };
  let updateEmail: Mock;
  let sendEmail: Mock;

  beforeEach(() => {
    updateEmail = vi.fn();
    sendEmail = vi.fn();
  });

  it("renders email client correctly", () => {
    render(
      <EmailClient
        email={mockEmail}
        updateEmail={updateEmail}
        sendEmail={sendEmail}
      />,
    );
    expect(screen.getByLabelText("Subject:")).toHaveValue(mockEmail.subject);
    expect(screen.getByLabelText("Body:")).toHaveValue(mockEmail.body);
  });

  it("calls updateEmail when the subject is changed", () => {
    render(
      <EmailClient
        email={mockEmail}
        updateEmail={updateEmail}
        sendEmail={sendEmail}
      />,
    );
    const newSubject = "New Subject";
    fireEvent.change(screen.getByLabelText("Subject:"), {
      target: { value: newSubject },
    });

    expect(updateEmail).toHaveBeenCalledWith(newSubject, mockEmail.body);
  });

  it("calls updateEmail when the body is changed", () => {
    render(
      <EmailClient
        email={mockEmail}
        updateEmail={updateEmail}
        sendEmail={sendEmail}
      />,
    );
    const newBody = "New Body";
    fireEvent.change(screen.getByLabelText("Body:"), {
      target: { value: newBody },
    });

    expect(updateEmail).toHaveBeenCalledWith(mockEmail.subject, newBody);
  });

  it("calls sendEmail when the send button is clicked", () => {
    render(
      <EmailClient
        email={mockEmail}
        updateEmail={updateEmail}
        sendEmail={sendEmail}
      />,
    );
    fireEvent.click(screen.getByText("Send"));

    expect(sendEmail).toHaveBeenCalled();
  });
});
