"use client";

import { api } from "@/trpc/react";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
  Textarea,
} from "@nextui-org/react";
import React, { useEffect } from "react";
import toast from "react-hot-toast";

interface RsvpFormProps {
  email: string;
  name: string;
}

const RsvpForm: React.FC<RsvpFormProps> = ({ email, name }) => {
  const [isAttending, setIsAttending] = React.useState(true);
  const [dietaryRequirements, setDietaryRequirements] = React.useState("");
  const [extraInformation, setExtraInformation] = React.useState("");

  const {
    data: existingRsvp,
    refetch,
    isLoading,
  } = api.rsvp.getGuestRSVP.useQuery();

  const { mutate: upsertGuestRSVP } = api.rsvp.upsertGuestRSVP.useMutation({
    onSuccess: () => {
      toast.success("RSVP updated!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: async () => {
      await refetch();
    },
  });

  useEffect(() => {
    if (existingRsvp) {
      setIsAttending(existingRsvp.isAttending);
      setDietaryRequirements(existingRsvp.dietaryRequirements ?? "");
      setExtraInformation(existingRsvp.extraInfo ?? "");
    }
  }, [existingRsvp]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex w-full max-w-screen-lg flex-col gap-4">
      <Popover placement="bottom" triggerScaleOnOpen={false}>
        <PopoverTrigger>
          <div className="flex flex-col gap-4 md:flex-row">
            <Input
              variant="bordered"
              isDisabled
              value={name}
              label="Your name"
              fullWidth
            />
            <Input
              variant="bordered"
              isDisabled
              value={email}
              label="Your email"
              fullWidth
            />
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <div>Not you? Sign out to log in as someone else.</div>
        </PopoverContent>
      </Popover>
      <Switch isSelected={isAttending} onValueChange={setIsAttending}>
        {isAttending ? "I'll be there!" : "I can't make it"}
      </Switch>
      <Textarea
        variant="bordered"
        label="Dietary Requirements"
        value={dietaryRequirements}
        onChange={(e) => setDietaryRequirements(e.target.value)}
        fullWidth
      />
      <Textarea
        variant="bordered"
        label="Extra Information"
        value={extraInformation}
        onChange={(e) => setExtraInformation(e.target.value)}
        fullWidth
      />
      <Button
        color="primary"
        variant="flat"
        onClick={() =>
          upsertGuestRSVP({
            isAttending,
            dietaryRequirements,
            extraInfo: extraInformation,
          })
        }
      >
        {!!existingRsvp ? "Update" : "Submit"} RSVP
      </Button>
    </div>
  );
};

export default RsvpForm;
