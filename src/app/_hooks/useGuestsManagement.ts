import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import { type TRPCClientErrorLike } from "@trpc/client";
import { type userRouter } from "@/server/api/routers/user";
import { useDebounce } from "use-debounce";
import { useState } from "react";

export interface Guest {
  id: string;
  name: string;
  email: string;
  group: "DAY" | "EVENING";
}

export const useGuestsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const { data, isLoading, error, fetchNextPage, hasNextPage, refetch } =
    api.user.getGuests.useInfiniteQuery(
      {
        limit: 30,
        search: debouncedSearchTerm,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const guests = data?.pages.flatMap((page) => page.items) ?? [];

  const commonMutationConfig = {
    onSuccess: async () => {
      await refetch();
      toast.success("Guest updated successfully");
    },
    onError: (error: TRPCClientErrorLike<typeof userRouter>) =>
      toast.error(error.message),
  };

  const addGuestMutation = api.user.addGuest.useMutation(commonMutationConfig);
  const editGuestMutation =
    api.user.editGuest.useMutation(commonMutationConfig);
  const deleteGuestMutation =
    api.user.deleteGuest.useMutation(commonMutationConfig);

  const addGuest = (newGuest: Omit<Guest, "id">) => {
    addGuestMutation.mutate(newGuest);
  };

  const editGuest = (guest: Guest) => {
    editGuestMutation.mutate(guest);
  };

  const deleteGuest = (guestId: string) => {
    deleteGuestMutation.mutate(guestId);
  };

  return {
    guests,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    searchTerm,
    setSearchTerm,
    addGuest,
    editGuest,
    deleteGuest,
  };
};
