"use client";

import moment from "moment";
import React from "react";
import { Card, CardBody, CardFooter, Chip } from "@nextui-org/react";

interface Email {
  subject: string;
  updatedAt: Date;
  sent: boolean;
}

const EmailCard: React.FC<Email> = ({ subject, updatedAt, sent }) => {
  return (
    <Card
      isPressable
      isHoverable
      shadow="none"
      className="flex-shrink-0 border-2 border-solid border-gray-500"
    >
      <CardBody className="h-16 w-52 flex-shrink-0">
        <div className="flex flex-shrink-0 justify-between">
          <h3 className="text-xs font-semibold">
            {subject.length > 55 ? subject.slice(0, 52) + "..." : subject}
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
}

const EmailList: React.FC<EmailListProps> = ({ emails }) => {
  return (
    <Card className="lg:h-full lg:w-1/4">
      <CardBody className="flex flex-row gap-1 overflow-scroll lg:flex-col">
        {emails.map((email) => (
          <EmailCard key={email.subject} {...email} />
        ))}
      </CardBody>
    </Card>
  );
};

export default EmailList;
