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
import { at } from "vitest/dist/chunks/reporters.WnPwkmgA.js";

interface RsvpFormProps {
  name: string;
  guests: string[];
}

const RsvpForm: React.FC<RsvpFormProps> = ({ name, guests }) => {
  const [nameToAttending, setNameToAttending] = React.useState<
    Record<string, boolean>
  >(guests.reduce((acc, guest) => ({ ...acc, [guest]: true }), {}));
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
      setDietaryRequirements(existingRsvp.dietaryRequirements ?? "");
      setExtraInformation(existingRsvp.extraInfo ?? "");
      existingRsvp.guestNames.forEach((guestName) => {
        setNameToAttending((prev) => ({
          ...prev,
          [guestName]:
            existingRsvp.attendingGuestNames.includes(guestName) ?? false,
        }));
      });
    }
  }, [existingRsvp]);

  const guestCount = Object.keys(nameToAttending).length;
  const allAttending = Object.values(nameToAttending).every(
    (attending) => attending,
  );

  if (isLoading) {
    return (
      <div className="flex w-full max-w-screen-lg flex-col gap-4">
        <div className="flex animate-pulse flex-col gap-4">
          <div className="flex animate-pulse flex-col gap-4 md:flex-row">
            <div className="h-12 w-full rounded bg-gray-300"></div>
          </div>
          <div className="h-12 w-44 rounded bg-gray-300"></div>
          <div className="h-24 rounded bg-gray-300"></div>
          <div className="h-24 rounded bg-gray-300"></div>
          <div className="h-12 rounded bg-gray-300"></div>
        </div>
      </div>
    );
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
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <div>Not you? Sign out to log in as someone else.</div>
        </PopoverContent>
      </Popover>
      <Switch
        isSelected={allAttending}
        onValueChange={(value) =>
          setNameToAttending((prev) => ({
            ...Object.fromEntries(
              Object.keys(prev).map((name) => [name, value]),
            ),
          }))
        }
      >
        {guestCount > 1
          ? allAttending
            ? "We'll all be there!"
            : "We can't all make it"
          : allAttending
            ? "I'll be there!"
            : "I can't make it"}
      </Switch>
      {guestCount > 1 &&
        Object.entries(nameToAttending).map(([guestName, guestAttending]) => (
          <Switch
            size="sm"
            key={guestName}
            isSelected={guestAttending}
            onValueChange={(value) =>
              setNameToAttending((prev) => ({ ...prev, [guestName]: value }))
            }
          >
            {guestAttending
              ? `${guestName} will be there!`
              : `${guestName} can't make it`}
          </Switch>
        ))}

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
            attendingGuestNames: Object.entries(nameToAttending)
              .filter(([, attending]) => attending)
              .map(([name]) => name),
            nonAttendingGuestNames: Object.entries(nameToAttending)
              .filter(([, attending]) => !attending)
              .map(([name]) => name),
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
