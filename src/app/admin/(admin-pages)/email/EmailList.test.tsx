import { describe, it, expect, vi, type Mock, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import EmailList from "./EmailList";
import moment from "moment";

describe("EmailList", () => {
  const mockEmails = [
    {
      id: "1",
      subject: "Test Email 1",
      body: "",
      updatedAt: new Date(),
      sent: true,
    },
    {
      id: "2",
      subject: "Test Email 2",
      body: "",
      updatedAt: new Date(),
      sent: false,
    },
  ];

  let setSelectedEmail: Mock;
  let createEmail: Mock;
  let deleteEmail: Mock;

  beforeEach(() => {
    setSelectedEmail = vi.fn();
    createEmail = vi.fn();
    deleteEmail = vi.fn();
  });

  it("renders email cards correctly", () => {
    render(
      <EmailList
        emails={mockEmails}
        createEmail={createEmail}
        deleteEmail={deleteEmail}
        setSelectedEmail={setSelectedEmail}
      />,
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
    render(
      <EmailList
        emails={mockEmails}
        createEmail={createEmail}
        deleteEmail={deleteEmail}
        setSelectedEmail={setSelectedEmail}
      />,
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
      body: "",
      updatedAt: new Date(),
      sent: true,
    };
    render(
      <EmailList
        emails={[longSubjectEmail]}
        createEmail={createEmail}
        deleteEmail={deleteEmail}
        setSelectedEmail={setSelectedEmail}
      />,
    );

    expect(
      screen.getByText("This is a very long subject that should be..."),
    ).toBeTruthy();
  });

  it("renders add and delete buttons", () => {
    render(
      <EmailList
        emails={mockEmails}
        createEmail={createEmail}
        deleteEmail={deleteEmail}
        setSelectedEmail={setSelectedEmail}
      />,
    );

    expect(screen.getByLabelText("Add email")).toBeTruthy();
    expect(screen.getByLabelText("Delete email")).toBeTruthy();
  });

  it("logs messages when add and delete buttons are clicked", () => {
    render(
      <EmailList
        emails={mockEmails}
        createEmail={createEmail}
        deleteEmail={deleteEmail}
        setSelectedEmail={setSelectedEmail}
      />,
    );

    fireEvent.click(screen.getByLabelText("Add email"));
    expect(createEmail).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Delete email"));
    expect(deleteEmail).toHaveBeenCalled();
  });
});
