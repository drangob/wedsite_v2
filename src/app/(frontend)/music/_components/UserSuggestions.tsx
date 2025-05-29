import React from "react";
import { api } from "@/trpc/server";
import UserSuggestionsList from "./UserSuggestionsList";
import { unstable_noStore as noStore } from "next/cache";

const UserSuggestions = async () => {
  noStore();
  const suggestions = await api.spotify.getUserSuggestions();

  return <UserSuggestionsList initialSuggestions={suggestions} />;
};

export default UserSuggestions;
