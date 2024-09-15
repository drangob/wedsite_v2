"use client";
import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  CardBody,
  CardFooter,
  Textarea,
} from "@nextui-org/react";
import { Send, User } from "lucide-react";

const EmailClient: React.FC = () => {
  const [newEmail, setNewEmail] = useState({ to: "", subject: "", body: "" });

  return (
    <Card className="h-full lg:w-3/4">
      <CardBody className="flex gap-4">
        <div className="flex gap-1">
          <Button variant="ghost" color="primary" className="flex-shrink-0">
            Select Users <User size="18px" />
          </Button>
          <Input isReadOnly variant="bordered" placeholder="To:" />
        </div>
        <Input
          label="Subject:"
          variant="bordered"
          value={newEmail.subject}
          onChange={(e) =>
            setNewEmail({ ...newEmail, subject: e.target.value })
          }
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
          value={newEmail.body}
          onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
        />
      </CardBody>
      <CardFooter className="flex flex-col items-end">
        <Button variant="ghost" color="primary">
          Send <Send size="18px" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailClient;
