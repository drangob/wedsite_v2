import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";

type Guest = {
  id?: string;
  name: string;
  email: string;
  group: "DAY" | "EVENING";
};

export type CreateUpdateModalSubmitHandler = (guest: Guest) => void;

interface GuestCreateUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: CreateUpdateModalSubmitHandler;
  initialGuest: Guest;
}

const GuestCreateUpdateModal: React.FC<GuestCreateUpdateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialGuest = { id: undefined, name: "", email: "", group: "DAY" },
}) => {
  const [guest, setGuest] = useState<Guest>({ ...initialGuest });

  // whenever the model opens or closes, update the initial guest state
  useEffect(() => {
    setGuest({ ...initialGuest });
  }, [isOpen, initialGuest]);

  const handleInputChange = (field: string, value: string) => {
    setGuest({ ...guest, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(guest);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader>Add/Edit Guest</ModalHeader>
          <ModalBody>
            <Input
              label="Name"
              value={guest.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              isRequired
            />
            <Input
              label="Email"
              type="email"
              value={guest.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              isRequired
              validationBehavior="native"
            />
            <Select
              label="Guest Group"
              selectedKeys={[guest.group]}
              onChange={(e) => handleInputChange("group", e.target.value)}
              isRequired
            >
              <SelectItem key="DAY" value="DAY">
                Day
              </SelectItem>
              <SelectItem key="EVENING" value="EVENING">
                Evening
              </SelectItem>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={onClose}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};

export default GuestCreateUpdateModal;
