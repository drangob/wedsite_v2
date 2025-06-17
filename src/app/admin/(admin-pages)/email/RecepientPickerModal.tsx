import { type Guest } from "@/app/_hooks/useGuestsManagement";
import { api } from "@/trpc/react";
import {
  Accordion,
  AccordionItem,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
} from "@nextui-org/react";
import React from "react";

interface RecepientPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  setTo: (emails: string[]) => void;
  to: string[];
}

const RecepientPickerModal: React.FC<RecepientPickerModalProps> = ({
  isOpen,
  onClose,
  setTo,
  to = [],
}) => {
  const { data: guests = [] } = api.user.getAllGuests.useQuery();
  interface GuestSelection {
    guest: Guest;
    selected: boolean;
  }
  const [dayGuests, setDayGuests] = React.useState<GuestSelection[]>([]);
  const [eveningGuests, setEveningGuests] = React.useState<GuestSelection[]>(
    [],
  );

  React.useEffect(() => {
    setDayGuests(
      guests
        .filter((guest) => guest.group === "DAY")
        .map((guest) => ({
          guest,
          selected: to.includes(guest.email),
        })),
    );
    setEveningGuests(
      guests
        .filter((guest) => guest.group === "EVENING")
        .map((guest) => ({ guest, selected: to.includes(guest.email) })),
    );
  }, [guests, to]);

  const allDayGuestsSelected = dayGuests.every((e) => e.selected);
  const allEveningGuestsSelected = eveningGuests.every((e) => e.selected);

  const handleSelectAllDayGuests = () => {
    setDayGuests((prev) =>
      prev.map((e) => ({
        ...e,
        selected: !allDayGuestsSelected,
      })),
    );
  };
  const handleSelectAllEveningGuests = () => {
    setEveningGuests((prev) =>
      prev.map((e) => ({
        ...e,
        selected: !allEveningGuestsSelected,
      })),
    );
  };
  const handleSelectDayGuest = (guest: Guest) => {
    setDayGuests((prev) =>
      prev.map((e) =>
        e.guest.id === guest.id ? { ...e, selected: !e.selected } : e,
      ),
    );
  };
  const handleSelectEveningGuest = (guest: Guest) => {
    setEveningGuests((prev) =>
      prev.map((e) =>
        e.guest.id === guest.id ? { ...e, selected: !e.selected } : e,
      ),
    );
  };

  const closeModal = () => {
    const flattenedEmails = dayGuests
      .concat(eveningGuests)
      .filter((e) => e.selected)
      .map((e) => e.guest.email);
    setTo(flattenedEmails);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="max-h-[calc(100vh-10rem)]"
    >
      <ModalContent>
        <ModalHeader>Select Recipients</ModalHeader>
        <ModalBody>
          <>
            <Switch
              isSelected={allDayGuestsSelected}
              onChange={handleSelectAllDayGuests}
            >
              <h2>Day Guests</h2>
            </Switch>
            <Accordion isCompact={true}>
              <AccordionItem
                title="Select specific day guests"
                aria-label="open specific day guest list"
                classNames={{ content: "overflow-auto max-h-80" }}
              >
                {dayGuests.map((e) => (
                  <Switch
                    key={e.guest.id}
                    className="block"
                    isSelected={e.selected}
                    onChange={() => handleSelectDayGuest(e.guest)}
                  >
                    {e.guest.name}
                  </Switch>
                ))}
              </AccordionItem>
            </Accordion>
            <Switch
              isSelected={allEveningGuestsSelected}
              onChange={handleSelectAllEveningGuests}
            >
              <h2>Evening Guests</h2>
            </Switch>
            <Accordion isCompact={true}>
              <AccordionItem
                title="Select specific evening guests"
                aria-label="open specific evening guest list"
                classNames={{ content: "overflow-auto max-h-80" }}
              >
                {eveningGuests.map((e) => (
                  <Switch
                    key={e.guest.id}
                    className="block"
                    isSelected={e.selected}
                    onChange={() => handleSelectEveningGuest(e.guest)}
                  >
                    {e.guest.name}
                  </Switch>
                ))}
              </AccordionItem>
            </Accordion>
          </>
        </ModalBody>
        <ModalFooter>
          <Button color="success" onPress={closeModal}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RecepientPickerModal;
