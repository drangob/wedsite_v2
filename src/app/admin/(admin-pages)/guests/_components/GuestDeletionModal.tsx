import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { type Guest } from "@/app/_hooks/useGuestsManagement";

interface GuestDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (guest: Guest) => void;
  guest: Guest;
}

const GuestDeletionModal: React.FC<GuestDeletionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  guest,
}) => {
  const handleConfirm = () => {
    onConfirm(guest);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Delete Guest</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete this guest?</p>
          <p>
            <strong>Name:</strong> {guest.name}
          </p>
          <p>
            <strong>Email:</strong> {guest.email}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="default" onPress={onClose}>
            Cancel
          </Button>
          <Button color="danger" onPress={handleConfirm}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GuestDeletionModal;
