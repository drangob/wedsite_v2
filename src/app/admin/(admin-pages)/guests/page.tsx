"use client";

import { api } from "@/trpc/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableRow,
  TableBody,
  TableCell,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
} from "@nextui-org/react";
import GuestModal, { type ModalSubmitHandler } from "./_components/GuestModal";
import { type Key, useState } from "react";
import toast from "react-hot-toast";
import { type TRPCClientErrorLike } from "@trpc/client";
import { type userRouter } from "@/server/api/routers/user";

const GuestsTable = () => {
  const utils = api.useUtils();
  const { data: guests = [], isLoading, error } = api.user.getGuests.useQuery();

  const commonMutationConfig = {
    onSuccess: async () => {
      await utils.user.getGuests.invalidate();
      toast.success("Guest updated successfully");
    },
    onError: (error: TRPCClientErrorLike<typeof userRouter>) =>
      toast.error(error.message),
  };
  const addGuestMutation = api.user.addGuest.useMutation({
    ...commonMutationConfig,
  });

  const editGuestMutation = api.user.editGuest.useMutation({
    ...commonMutationConfig,
  });

  const deleteGuestMutation = api.user.deleteGuest.useMutation({
    ...commonMutationConfig,
  });

  type Guest = (typeof guests)[0];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalSubmitFunc, setModalSubmitFunc] = useState<ModalSubmitHandler>(
    () => undefined,
  );
  const [selectedGuest, setSelectedGuest] = useState<Guest>({
    id: "",
    name: "",
    email: "",
    group: "day",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

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

  type GuestRowItem = (typeof rows)[0];

  const handleDelete = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsDeletionModalOpen(true);
  };

  const handleConfirmDelete = (guest: Guest) => {
    deleteGuestMutation.mutate(guest.id);
    setIsDeletionModalOpen(false);
  };

  const handleCloseDeletionModal = () => {
    setIsDeletionModalOpen(false);
  };

  const handleSubmitNew = (newGuest: Guest) => {
    addGuestMutation.mutate({
      name: newGuest.name,
      email: newGuest.email,
      group: newGuest.group,
    });
    setIsModalOpen(false);
  };

  const handleSubmitEdit = (guest: Guest) => {
    console.log(guest);
    editGuestMutation.mutate({
      id: guest.id,
      name: guest.name,
      email: guest.email,
      group: guest.group,
    });
    setIsModalOpen(false);
  };

  const handleAddNew = () => {
    setSelectedGuest({ id: "", name: "", email: "", group: "day" });
    setModalSubmitFunc(() => handleSubmitNew);
    setIsModalOpen(true);
  };

  const handleEdit = (guest: Guest) => {
    setSelectedGuest(guest);
    setModalSubmitFunc(() => handleSubmitEdit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
      <GuestModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={modalSubmitFunc}
        initialGuest={selectedGuest}
      />
      <Modal isOpen={isDeletionModalOpen} onClose={handleCloseDeletionModal}>
        <ModalContent>
          <ModalHeader>Delete Guest</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this guest?</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              onPress={() => handleConfirmDelete(selectedGuest)}
            >
              Yes
            </Button>
            <Button onPress={handleCloseDeletionModal}>No</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GuestsTable;
