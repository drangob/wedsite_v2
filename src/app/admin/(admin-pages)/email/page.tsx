"use client";

import { api } from "@/trpc/react";
import EmailClient from "./EmailClient";
import EmailList from "./EmailList";

const EmailPage = () => {
  // get list of emails
  const { data: emails } = api.email.getAllEmails.useQuery();

  if (!emails) {
    return null;
  }

  return (
    <div className="flex h-[90vh] flex-col gap-2 lg:flex-row">
      <EmailList emails={emails} />
      <EmailClient />
    </div>
  );
};

export default EmailPage;
