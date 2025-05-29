"use client";

import { Button } from "@nextui-org/react";
import { api } from "@/trpc/react";

export const DownloadSuggestionsButton = () => {
  const { refetch: fetchCSV, isFetching } =
    api.spotify.getAllSuggestedSongsCSV.useQuery(undefined, {
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
    a.download = "suggestions.csv";
    a.click();
  };

  return (
    <Button onPress={() => saveCSV()} isLoading={isFetching}>
      Download Suggestions
    </Button>
  );
};
