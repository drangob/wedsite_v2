"use client";

import { useState } from "react";
import { Button, Input } from "@nextui-org/react";
import { type Guest } from "../../../_hooks/useGuestsManagement";
import { useGuestsManagement } from "../../../_hooks/useGuestsManagement";
import CreateUpdateGuestModal, {
  type CreateUpdateModalSubmitHandler,
} from "./_components/GuestCreateUpdateModal";
import GuestDeletionModal from "./_components/GuestDeletionModal";
import GuestsTable from "./_components/GuestTable";

const GuestsPage = () => {
  const {
    guests,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    addGuest,
    editGuest,
    deleteGuest,
    searchTerm,
    setSearchTerm,
  } = useGuestsManagement();

  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [createUpdateModalSubmitFunc, setModalSubmitFunc] =
    useState<CreateUpdateModalSubmitHandler>(() => undefined);
  const [selectedGuest, setSelectedGuest] = useState<Guest>({
    id: "",
    name: "",
    email: "",
    group: "day",
  });

  if (error) return <div>Error: {error.message}</div>;

  const handleDelete = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsDeletionModalOpen(true);
  };

  const handleConfirmDelete = (guest: Guest) => {
    deleteGuest(guest.id);
    setIsDeletionModalOpen(false);
  };

  const handleCloseDeletionModal = () => {
    setIsDeletionModalOpen(false);
  };

  const handleSubmitNew = (newGuest: Guest) => {
    addGuest({
      name: newGuest.name,
      email: newGuest.email,
      group: newGuest.group,
    });
    setIsCreateUpdateModalOpen(false);
  };

  const handleSubmitEdit = (guest: Guest) => {
    console.log(guest);
    editGuest({
      id: guest.id,
      name: guest.name,
      email: guest.email,
      group: guest.group,
    });
    setIsCreateUpdateModalOpen(false);
  };

  const handleAddNew = () => {
    setSelectedGuest({ id: "", name: "", email: "", group: "day" });
    setModalSubmitFunc(() => handleSubmitNew);
    setIsCreateUpdateModalOpen(true);
  };

  const handleEdit = (guest: Guest) => {
    setSelectedGuest(guest);
    setModalSubmitFunc(() => handleSubmitEdit);
    setIsCreateUpdateModalOpen(true);
  };

  const handleCloseCreateUpdateModal = () => {
    setIsCreateUpdateModalOpen(false);
  };

  return (
    <>
      <div className="mb-4 flex justify-between">
        <Input
          placeholder="Search guests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Button color="primary" onPress={handleAddNew}>
          Add New Guest
        </Button>
      </div>
      <GuestsTable
        guests={guests}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      />
      <CreateUpdateGuestModal
        isOpen={isCreateUpdateModalOpen}
        onClose={handleCloseCreateUpdateModal}
        onSubmit={createUpdateModalSubmitFunc}
        initialGuest={selectedGuest}
      />
      <GuestDeletionModal
        isOpen={isDeletionModalOpen}
        onClose={handleCloseDeletionModal}
        onConfirm={handleConfirmDelete}
        guest={selectedGuest}
      />
    </>
  );
};

export default GuestsPage;
