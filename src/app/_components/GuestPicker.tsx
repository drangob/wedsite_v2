"use client";

import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete";
import { Button } from "@nextui-org/react";
import { type FormEvent, type Key, useState } from "react";

import { signIn } from "next-auth/react";
import { useGuestsManagement } from "../_hooks/useGuestsManagement";
import { api } from "@/trpc/react";

interface GuestPickerProps {
  callbackUrl: string;
  uid?: string;
}

export default function GuestPicker({
  callbackUrl = "/",
  uid,
}: GuestPickerProps) {
  const { guests, isLoading, searchTerm, setSearchTerm } =
    useGuestsManagement();
  const { data: uidExists } = api.user.uidExists.useQuery(
    { uid: uid ?? "" },
    { enabled: !!uid }, // Only run the query if uid is not null
  );

  const [selectedUserId, setSelectedUserId] = useState<Key | null>();
  const [loggingIn, setLoggingIn] = useState(false);

  const login = async (uid: string) => {
    // combine callbackUrl with the current origin
    const redirect = new URL(callbackUrl, window.location.origin);
    // remove the uid query parameter
    redirect.searchParams.delete("uid");
    await signIn("guest-credentials", {
      user_id: uid,
      callbackUrl: redirect.href,
    });
  };

  if (uid && uidExists) {
    login(uid).catch((error) => {
      console.error("Failed to sign in", error);
    });
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedUserId) {
      setLoggingIn(true);
      try {
        await login(selectedUserId as string);
      } catch (error) {
        console.error("Failed to sign in", error);
        setLoggingIn(false);
      }
    }
  };

  return (
    <form className="flex" onSubmit={(e) => handleLogin(e)}>
      <Autocomplete
        className="h-12 w-full"
        label="What's your name?"
        defaultItems={guests}
        isLoading={isLoading}
        inputValue={searchTerm}
        onInputChange={(value) => setSearchTerm(value)}
        isClearable={false}
        onSelectionChange={(user_id) => setSelectedUserId(user_id)}
        selectorButtonProps={isLoading ? {} : { className: "hidden" }}
        popoverProps={
          searchTerm.length < 2 || isLoading ? { className: "hidden" } : {}
        }
        disabled={loggingIn}
      >
        {(guest) => (
          <AutocompleteItem key={guest.id}>{guest.name}</AutocompleteItem>
        )}
      </Autocomplete>
      <Button
        className="ml-1 h-12"
        type="submit"
        color="primary"
        disabled={loggingIn}
        isLoading={loggingIn}
      >
        Login
      </Button>
    </form>
  );
}
