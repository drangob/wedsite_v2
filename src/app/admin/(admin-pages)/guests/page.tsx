"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableRow,
  TableBody,
  TableCell,
  Button,
  Input,
} from "@nextui-org/react";
import CreateUpdateGuestModal, {
  type CreateUpdateModalSubmitHandler,
} from "./_components/GuestCreateUpdateModal";
import { type Key, useState } from "react";
import GuestDeletionModal from "./_components/GuestDeletionModal";
import { useGuestsManagement } from "./_hooks/useGuestsManagement";

const GuestsTable = () => {
  const { guests, isLoading, error, addGuest, editGuest, deleteGuest } =
    useGuestsManagement();

  type Guest = (typeof guests)[0];
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [createUpdateModalSubmitFunc, setModalSubmitFunc] =
    useState<CreateUpdateModalSubmitHandler>(() => undefined);
  const [selectedGuest, setSelectedGuest] = useState<Guest>({
    id: "",
    name: "",
    email: "",
    group: "day",
  });

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "group", label: "Group" },
    { key: "actions", label: "Actions" },
  ];

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const rows = filteredGuests.map((guest) => ({
    key: guest.id,
    name: guest.name,
    email: guest.email,
    group: guest.group,
    actions: (
      <div>
        <Button size="sm" color="primary" onPress={() => handleEdit(guest)}>
          Edit
        </Button>
        <Button size="sm" color="danger" onPress={() => handleDelete(guest)}>
          Delete
        </Button>
      </div>
    ),
  }));

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  type GuestRowItem = (typeof rows)[0];

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
      <Table aria-label="Guests table" className="h-auto min-w-full">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={rows}>
          {(item: GuestRowItem) => (
            <TableRow key={item.key}>
              {(columnKey: Key) => (
                <TableCell>{item[columnKey as keyof GuestRowItem]}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
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

export default GuestsTable;
