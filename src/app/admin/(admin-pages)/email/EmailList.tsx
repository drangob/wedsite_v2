"use client";

import moment from "moment";
import React from "react";
import { Button, Card, CardBody, CardFooter, Chip } from "@nextui-org/react";
import { CircleStopIcon, PlusCircleIcon } from "lucide-react";
import { type Email } from "./page";

interface EmailCardProps {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
}

const EmailCard: React.FC<EmailCardProps> = ({
  email: { subject, updatedAt, sent },
  isSelected,
  onClick,
}) => {
  return (
    <Card
      isPressable
      isHoverable
      shadow="none"
      className={`flex-shrink-0 border-2 border-solid border-gray-500 ${isSelected ? "bg-gray-200" : ""}`}
      onClick={onClick}
    >
      <CardBody className="h-16 w-52 flex-shrink-0 overflow-hidden">
        <div className="flex flex-shrink-0 justify-between ">
          <h3 className={`text-xs ${isSelected ? "font-semibold" : ""}`}>
            {subject.length > 45 ? subject.slice(0, 42) + "..." : subject}
          </h3>
          <Chip color={sent ? "success" : "warning"} className="ml-2">
            {sent ? "Sent" : "Draft"}
          </Chip>
        </div>
      </CardBody>
      <CardFooter>
        <p className="mt-1 text-xs text-gray-500">
          {moment(updatedAt).format("HH:mm - ll")}
        </p>
      </CardFooter>
    </Card>
  );
};

interface EmailListProps {
  emails: Email[];
  selectedEmail?: Email;
  setSelectedEmail: (email: Email) => void;
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmail,
  setSelectedEmail,
}) => {
  const addEmail = () => {
    console.log("Add email");
  };

  const deleteEmail = () => {
    console.log("Delete email");
  };

  return (
    <Card className="lg:h-full lg:w-1/4">
      <CardBody className="flex flex-row gap-1 overflow-scroll lg:flex-col">
        {emails.map((email) => (
          <EmailCard
            key={email.subject}
            email={email}
            isSelected={selectedEmail?.id === email.id}
            onClick={() => setSelectedEmail(email)}
          />
        ))}
      </CardBody>
      <CardFooter className="flex justify-center gap-2">
        <Button
          variant="solid"
          color="primary"
          isIconOnly
          onClick={addEmail}
          aria-label="Add email"
        >
          <PlusCircleIcon />
        </Button>
        <Button
          variant="solid"
          color="danger"
          isIconOnly
          onClick={deleteEmail}
          aria-label="Delete email"
        >
          <CircleStopIcon />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailList;
