"use client";

import { api } from "@/trpc/react";
import { useDebounce } from "use-debounce";
import { useState } from "react";
import { type z } from "zod";
import {
  type rsvpRouter,
  type GuestRSVPSchema,
  type RSVPSchema,
  type getUserRSVPsInput,
} from "@/server/api/routers/rsvp";
import toast from "react-hot-toast";
import { type TRPCClientErrorLike } from "@trpc/client";

export type RSVP = z.infer<typeof RSVPSchema>;
export type GuestRSVP = z.infer<typeof GuestRSVPSchema>;
export type SortField = Exclude<
  z.infer<typeof getUserRSVPsInput.shape.sortField>,
  undefined
>;
export type GuestRSVPFilters = Exclude<
  z.infer<typeof getUserRSVPsInput.shape.filters>,
  undefined
>;

export const useRSVPManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<GuestRSVPFilters>({});

  const { data, isLoading, error, fetchNextPage, hasNextPage, refetch } =
    api.rsvp.getUserRSVPs.useInfiniteQuery(
      {
        limit: 30,
        search: debouncedSearchTerm,
        sortField,
        sortOrder,
        filters: filters,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const { data: toplineData, refetch: refetchTopLineData } =
    api.rsvp.getToplineData.useQuery();

  const commonMutationConfig = {
    onSuccess: async () => {
      await refetch();
      await refetchTopLineData();
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
      attendingGuestNames: guestRSVP.rsvp?.attendingGuestNames ?? [],
      nonAttendingGuestNames: guestRSVP.rsvp?.nonAttendingGuestNames ?? [],
      dietaryRequirements: guestRSVP.rsvp?.dietaryRequirements ?? "",
      extraInfo: guestRSVP.rsvp?.extraInfo ?? "",
    });
  };

  const { refetch: fetchCSV } = api.rsvp.getCSV.useQuery(undefined, {
    enabled: false,
  });
  const saveCSV = async () => {
    const result = await fetchCSV();
    const csv = result?.data;
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv" });
    console.log(blob);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rsvp.csv";
    a.click();
  };

  const allUsersCount = toplineData?.guestUserCount ?? 0;
  const rsvpCount = toplineData?.rsvpCount ?? 0;
  const dietaryRequirementsCount = toplineData?.dietryReqCount ?? 0;
  const extraInfoCount = toplineData?.extraInfoCount ?? 0;
  const totalGuestsCount = toplineData?.totalGuestsCount ?? 0;
  const attendingGuestCount = toplineData?.attendingGuestCount ?? 0;

  return {
    guestRSVPs,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    searchTerm,
    setSearchTerm,
    upsertGuestRSVP,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    filters,
    setFilters,
    allUsersCount,
    rsvpCount,
    dietaryRequirementsCount,
    extraInfoCount,
    totalGuestsCount,
    attendingGuestCount,
    saveCSV,
  };
};
