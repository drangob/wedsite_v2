"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  Input,
  Button,
  CardBody,
  CardFooter,
  Textarea,
} from "@nextui-org/react";
import { Send, User } from "lucide-react";
import { type Email } from "./page";
import { useDebounce } from "use-debounce";
import RecepientPickerModal from "./RecepientPickerModal";

interface EmailClientProps {
  email: Email | undefined;
  updateEmail: (subject: string, body: string, to: string[]) => void;
  sendEmail: () => void;
}

const EmailClient: React.FC<EmailClientProps> = ({
  email: selectedEmail,
  updateEmail,
  sendEmail,
}) => {
  const [email, setEmail] = useState(selectedEmail);
  const [debouncedEmail] = useDebounce(email, 500);
  const [isRecepientPickerOpen, setIsRecepientPickerOpen] = useState(false);
  const [to, setTo] = useState<string[]>(email?.to ?? []);

  useEffect(() => {
    setEmail((prev) => {
      if (prev) {
        return {
          ...prev,
          to,
        };
      }
    });
  }, [setEmail, to]);

  useEffect(() => {
    // Update email if it has changed from the initial values
    if (
      debouncedEmail &&
      (debouncedEmail.subject !== selectedEmail?.subject ||
        debouncedEmail.body !== selectedEmail?.body ||
        debouncedEmail.to !== selectedEmail?.to)
    ) {
      updateEmail(
        debouncedEmail.subject,
        debouncedEmail.body,
        debouncedEmail.to,
      );
    }
  }, [debouncedEmail, selectedEmail, updateEmail]);

  if (!email) {
    return <Card className="h-full lg:w-3/4"></Card>;
  }

  return (
    <>
      <Card className="h-full lg:w-3/4">
        <CardBody className="flex gap-4">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              color="primary"
              className="flex-shrink-0"
              onClick={() => setIsRecepientPickerOpen(true)}
              disabled={email.sent}
              isDisabled={email.sent}
            >
              Select Users <User size="18px" />
            </Button>
            <Input
              isReadOnly
              variant="bordered"
              placeholder="To:"
              aria-label="To:"
              value={"To: " + to.join(", ")}
              disabled={email.sent}
              isDisabled={email.sent}
            />
          </div>
          <Input
            label="Subject:"
            variant="bordered"
            value={email.subject}
            onChange={(e) => setEmail({ ...email, subject: e.target.value })}
            disabled={email.sent}
            isDisabled={email.sent}
          />
          <Textarea
            label="Body:"
            variant="bordered"
            disableAutosize
            classNames={{
              input: "h-full",
              inputWrapper: "!h-full",
            }}
            className="!h-full"
            value={email.body}
            onChange={(e) => setEmail({ ...email, body: e.target.value })}
            disabled={email.sent}
            isDisabled={email.sent}
          />
        </CardBody>
        <CardFooter className="flex flex-col items-end">
          <Button
            variant="ghost"
            color="primary"
            onClick={() => {
              setEmail((prev) => {
                if (!prev) {
                  return;
                }
                return { ...prev, sent: true };
              });
              sendEmail();
            }}
            disabled={email.sent}
            isDisabled={email.sent}
          >
            Send <Send size="18px" />
          </Button>
        </CardFooter>
      </Card>
      <RecepientPickerModal
        isOpen={isRecepientPickerOpen}
        onClose={() => setIsRecepientPickerOpen(false)}
        setTo={setTo}
        to={to}
      />
    </>
  );
};

export default EmailClient;
