import { api } from "@/trpc/react";
import { useDebounce } from "use-debounce";
import { useState } from "react";

export const useRSVPManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const { data, isLoading, error, fetchNextPage, hasNextPage } =
    api.rsvp.getRSVPs.useInfiniteQuery(
      {
        limit: 30,
        search: debouncedSearchTerm,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const rsvps = data?.pages.flatMap((page) => page.items) ?? [];

  return {
    rsvps,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    searchTerm,
    setSearchTerm,
  };
};
