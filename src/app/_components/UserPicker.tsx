"use client";

import { api } from "@/trpc/react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete";
import { Button } from "@nextui-org/react";
import { type FormEvent, type Key, useState } from "react";

import { signIn } from "next-auth/react";

export default function UserPicker() {
  const userQuery = api.user.getGuests.useQuery();

  const users = userQuery.data ?? [];

  const [selectedUserId, setSelectedUserId] = useState<Key | null>();
  const [inputLength, setInputLength] = useState(0);

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    if (selectedUserId) {
      signIn("guest-credentials", { user_id: selectedUserId }).catch(
        (error) => {
          console.error("Failed to sign in", error);
        },
      );
    }
  };

  return (
    <form className="flex" onSubmit={(e) => handleLogin(e)}>
      <Autocomplete
        className="h-12 w-full"
        label="What's your name?"
        defaultItems={users}
        isClearable={false}
        onSelectionChange={(user_id) => setSelectedUserId(user_id)}
        selectorButtonProps={{ className: "hidden" }}
        popoverProps={inputLength < 2 ? { className: "hidden" } : {}}
        onInputChange={(value) => setInputLength(value.length)}
      >
        {(user) => (
          <AutocompleteItem key={user.id}>{user.name}</AutocompleteItem>
        )}
      </Autocomplete>
      <Button className="ml-1 h-12" type="submit">
        Login
      </Button>
    </form>
  );
}
