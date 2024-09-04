"use client";
import React from "react";

import { useRSVPManagement } from "@/app/_hooks/useRSVPManagement";

const RSVPPage = () => {
  const {
    rsvps,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    searchTerm,
    setSearchTerm,
  } = useRSVPManagement();

  return (
    <>
      {rsvps.map((rsvp) => (
        <div key={rsvp.id}>
          <p>{rsvp.guest.name}</p>
          <p>{rsvp.guest.email}</p>
          <p>{rsvp.isAttending ? "Attending" : "Not attending"}</p>
          <p>{rsvp.dietaryRequirements}</p>
          <p>{rsvp.extraInfo}</p>
        </div>
      ))}
    </>
  );
};

export default RSVPPage;
