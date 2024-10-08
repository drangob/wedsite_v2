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
import { type Guest } from "@/app/_hooks/useGuestsManagement";

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
  initialGuest = {
    id: "",
    name: "",
    email: "",
    group: "DAY",
    guestNames: [],
  },
}) => {
  const [guest, setGuest] = useState<Guest>({ ...initialGuest });

  // whenever the model opens or closes, update the initial guest state
  useEffect(() => {
    setGuest({ ...initialGuest });
  }, [isOpen, initialGuest]);

  const handleInputChange = (field: string, value: string) => {
    // handle guestNames[0] field
    if (field.includes("guestNames")) {
      const match = field.match(/\d+/);
      const index = match ? parseInt(match[0]) : 0;
      const guestNames = [...guest.guestNames];
      guestNames[index] = value;
      setGuest({ ...guest, guestNames });
      console.log(guest);
      return;
    }
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
            <div className="flex flex-col gap-4">
              {guest.guestNames.map((guestName, index) => (
                <Input
                  key={index}
                  label={`Guest ${index + 1}`}
                  type="text"
                  value={guestName}
                  onChange={(e) =>
                    handleInputChange(`guestNames[${index}]`, e.target.value)
                  }
                  isRequired
                  validationBehavior="native"
                />
              ))}
              <div className="mt-4 flex flex-row justify-center gap-4">
                <Button
                  color="primary"
                  variant="flat"
                  onClick={() =>
                    setGuest({
                      ...guest,
                      guestNames: [...guest.guestNames, ""],
                    })
                  }
                >
                  Add Guest
                </Button>
                <Button
                  color="danger"
                  variant="flat"
                  isDisabled={guest.guestNames.length <= 1}
                  onClick={() => {
                    if (guest.guestNames.length > 1) {
                      setGuest({
                        ...guest,
                        guestNames: guest.guestNames.slice(0, -1),
                      });
                    }
                  }}
                >
                  Remove Guest
                </Button>
              </div>
            </div>
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
