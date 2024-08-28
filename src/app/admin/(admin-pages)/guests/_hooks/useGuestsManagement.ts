import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import { type TRPCClientErrorLike } from "@trpc/client";
import { type userRouter } from "@/server/api/routers/user";

interface Guest {
  id: string;
  name: string;
  email: string;
  group: "day" | "evening";
}

export const useGuestsManagement = () => {
  const {
    data: guests = [],
    isLoading,
    error,
    refetch,
  } = api.user.getGuests.useQuery();

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
    addGuest,
    editGuest,
    deleteGuest,
  };
};
