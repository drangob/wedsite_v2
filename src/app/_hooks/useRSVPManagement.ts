import { api } from "@/trpc/react";
import { useDebounce } from "use-debounce";
import { useState } from "react";
import { type z } from "zod";
import {
  type rsvpRouter,
  type GuestRSVPSchema,
  type RSVPSchema,
} from "@/server/api/routers/rsvp";
import toast from "react-hot-toast";
import { type TRPCClientErrorLike } from "@trpc/client";

export type RSVP = z.infer<typeof RSVPSchema>;
export type GuestRSVP = z.infer<typeof GuestRSVPSchema>;

export const useRSVPManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const { data, isLoading, error, fetchNextPage, hasNextPage, refetch } =
    api.rsvp.getUserRSVPs.useInfiniteQuery(
      {
        limit: 30,
        search: debouncedSearchTerm,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const commonMutationConfig = {
    onSuccess: async () => {
      await refetch();
      toast.success("RSVP updated successfully");
    },
    onError: (error: TRPCClientErrorLike<typeof rsvpRouter>) =>
      toast.error(error.message),
  };

  const upsertGuestRSVPMutation =
    api.rsvp.upsertGuestRSVP.useMutation(commonMutationConfig);

  const guestRSVPs = data?.pages.flatMap((page) => page.items) ?? [];

  const upsertGuestRSVP = (guestRSVP: GuestRSVP) => {
    upsertGuestRSVPMutation.mutate({
      userId: guestRSVP.guest.id,
      isAttending: guestRSVP.rsvp?.isAttending ?? false,
      dietaryRequirements: guestRSVP.rsvp?.dietaryRequirements ?? "",
      extraInfo: guestRSVP.rsvp?.extraInfo ?? "",
    });
  };

  return {
    guestRSVPs,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    searchTerm,
    setSearchTerm,
    upsertGuestRSVP,
  };
};