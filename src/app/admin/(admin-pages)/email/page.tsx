"use client";

import { api } from "@/trpc/react";
import EmailClient from "./EmailClient";
import EmailList from "./EmailList";
import { use, useEffect, useState } from "react";
export interface Email {
  id: string;
  subject: string;
  updatedAt: Date;
  sent: boolean;
}

const EmailPage = () => {
  // get list of emails
  const { data: emails } = api.email.getAllEmails.useQuery();

  const [selectedEmail, setSelectedEmail] = useState<Email | undefined>();
  useEffect(() => {
    if (emails) {
      setSelectedEmail(emails[0]);
    }
  }, [emails]);

  if (!emails) {
    return null;
  }

  return (
    <div className="flex h-[90vh] flex-col gap-2 lg:flex-row">
      <EmailList
        emails={emails}
        selectedEmail={selectedEmail}
        setSelectedEmail={setSelectedEmail}
      />
      <EmailClient />
    </div>
  );
};

export default EmailPage;
