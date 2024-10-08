import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import { type TRPCClientErrorLike } from "@trpc/client";
import { type userRouter } from "@/server/api/routers/user";
import { useDebounce } from "use-debounce";
import { useMemo, useState } from "react";

export interface Guest {
  id: string;
  name: string;
  email: string;
  group: "DAY" | "EVENING";
  guestNames: string[];
}

export const useGuestsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const isDebouncing = searchTerm !== debouncedSearchTerm;

  const { data, isFetching, error, fetchNextPage, hasNextPage, refetch } =
    api.user.getGuests.useInfiniteQuery(
      {
        limit: 30,
        search: debouncedSearchTerm,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const guests = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

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
    isLoading: isFetching || isDebouncing,
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
