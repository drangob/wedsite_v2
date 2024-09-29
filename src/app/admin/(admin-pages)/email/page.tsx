"use client";

import { api } from "@/trpc/react";
import EmailClient from "./EmailClient";
import EmailList from "./EmailList";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { type TRPCClientErrorLike } from "@trpc/client";
import { type emailRouter } from "@/server/api/routers/email";
export interface Email {
  id: string;
  subject: string;
  body: string;
  updatedAt: Date;
  sent: boolean;
  to: string[];
}

const EmailPage = () => {
  // get list of emails
  const { data: emails, refetch } = api.email.getAllEmails.useQuery();
  const getCommonMutationConfig = (toastMsg: string) => ({
    onSuccess: async () => {
      await refetch();
      toast.success(toastMsg);
    },
    onError: (error: TRPCClientErrorLike<typeof emailRouter>) =>
      toast.error(error.message),
  });

  const { mutate: createEmailMutate } = api.email.createEmail.useMutation(
    getCommonMutationConfig("Email created successfully"),
  );

  const { mutate: deleteEmailMutate } = api.email.deleteEmail.useMutation(
    getCommonMutationConfig("Email deleted successfully"),
  );
  const { mutate: updateEmailMutate } = api.email.updateEmail.useMutation(
    getCommonMutationConfig("Email saved"),
  );

  const [selectedEmail, setSelectedEmail] = useState<Email | undefined>();

  useEffect(() => {
    if (emails && !emails.find((email) => email.id === selectedEmail?.id)) {
      setSelectedEmail(emails[0]);
    }
  }, [emails, selectedEmail]);

  const createEmail = useCallback(
    () => createEmailMutate(),
    [createEmailMutate],
  );
  const deleteEmail = useCallback(() => {
    if (selectedEmail) deleteEmailMutate({ id: selectedEmail.id });
  }, [deleteEmailMutate, selectedEmail]);

  const updateEmail = useCallback(
    (subject: string, body: string, to: string[]) => {
      if (selectedEmail?.id) {
        updateEmailMutate({
          id: selectedEmail.id,
          subject: subject,
          body: body,
          to: to,
        });
      }
    },
    [selectedEmail?.id, updateEmailMutate],
  );

  if (!emails) {
    return null;
  }

  return (
    <div className="flex h-[90vh] flex-col gap-2 lg:flex-row">
      <EmailList
        emails={emails}
        selectedEmail={selectedEmail}
        setSelectedEmail={setSelectedEmail}
        createEmail={createEmail}
        deleteEmail={deleteEmail}
      />
      <EmailClient
        key={selectedEmail?.id}
        email={selectedEmail}
        updateEmail={updateEmail}
        sendEmail={() => {
          console.log("Sending email", selectedEmail);
        }}
      />
    </div>
  );
};

export default EmailPage;
