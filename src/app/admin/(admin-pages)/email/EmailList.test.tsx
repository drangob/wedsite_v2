import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import EmailList from "./EmailList";
import moment from "moment";

describe("EmailList", () => {
  const mockEmails = [
    { id: "1", subject: "Test Email 1", updatedAt: new Date(), sent: true },
    { id: "2", subject: "Test Email 2", updatedAt: new Date(), sent: false },
  ];

  it("renders email cards correctly", () => {
    const setSelectedEmail = vi.fn();
    render(
      <EmailList emails={mockEmails} setSelectedEmail={setSelectedEmail} />,
    );

    mockEmails.forEach((email) => {
      expect(screen.getByText(email.subject)).toBeTruthy();
      expect(screen.getByText(email.sent ? "Sent" : "Draft")).toBeTruthy();
      expect(
        screen.getAllByText(moment(email.updatedAt).format("HH:mm - ll")),
      ).toHaveLength(2);
    });
  });

  it("calls setSelectedEmail when an email card is clicked", () => {
    const setSelectedEmail = vi.fn();
    render(
      <EmailList emails={mockEmails} setSelectedEmail={setSelectedEmail} />,
    );

    if (mockEmails[0]?.subject) {
      fireEvent.click(screen.getByText(mockEmails[0].subject));
    }
    expect(setSelectedEmail).toHaveBeenCalledWith(mockEmails[0]);
  });

  it("handles long subject lines correctly", () => {
    const longSubjectEmail = {
      id: "3",
      subject: "This is a very long subject that should be truncated",
      updatedAt: new Date(),
      sent: true,
    };
    const setSelectedEmail = vi.fn();
    render(
      <EmailList
        emails={[longSubjectEmail]}
        setSelectedEmail={setSelectedEmail}
      />,
    );

    expect(
      screen.getByText("This is a very long subject that should be..."),
    ).toBeTruthy();
  });

  it("renders add and delete buttons", () => {
    const setSelectedEmail = vi.fn();
    render(
      <EmailList emails={mockEmails} setSelectedEmail={setSelectedEmail} />,
    );

    expect(screen.getByLabelText("Add email")).toBeTruthy();
    expect(screen.getByLabelText("Delete email")).toBeTruthy();
  });

  it("logs messages when add and delete buttons are clicked", () => {
    const consoleSpy = vi.spyOn(console, "log");
    const setSelectedEmail = vi.fn();
    render(
      <EmailList emails={mockEmails} setSelectedEmail={setSelectedEmail} />,
    );

    fireEvent.click(screen.getByLabelText("Add email"));
    expect(consoleSpy).toHaveBeenCalledWith("Add email");

    fireEvent.click(screen.getByLabelText("Delete email"));
    expect(consoleSpy).toHaveBeenCalledWith("Delete email");

    consoleSpy.mockRestore();
  });
});
