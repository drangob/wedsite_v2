"use client";
import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Spinner,
  TableBody,
  TableHeader,
  TableCell,
  TableRow,
  TableColumn,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Switch,
} from "@nextui-org/react";
import {
  type GuestRSVP,
  type RSVP,
  useRSVPManagement,
} from "@/app/_hooks/useRSVPManagement";
import { CheckCircle, XCircle } from "lucide-react";

const RSVPPage = () => {
  const {
    guestRSVPs,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    searchTerm,
    setSearchTerm,
    upsertGuestRSVP,
  } = useRSVPManagement();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRSVP, setSelectedRSVP] = useState<GuestRSVP | null>(null);

  const handleRowClick = (guestRSVP: GuestRSVP) => {
    setSelectedRSVP(guestRSVP);
    onOpen();
  };

  const handleUpdateRSVP = (updatedRSVP: GuestRSVP) => {
    upsertGuestRSVP(updatedRSVP);
    onClose();
  };

  const getCheckmark = (value: boolean | string | undefined) => {
    if (value === undefined) return null;

    return value ? (
      <CheckCircle className="text-green-500" />
    ) : (
      <XCircle className="text-red-500" />
    );
  };

  return (
    <div className="p-4">
      <Input
        placeholder="Search RSVPs"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      {isLoading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <>
          <Table aria-label="RSVP Table">
            <TableHeader>
              <TableColumn key="name" allowsSorting>
                Name
              </TableColumn>
              <TableColumn key="hasRSVP" allowsSorting>
                Has RSVP?
              </TableColumn>
              <TableColumn key="status" allowsSorting>
                Attending?
              </TableColumn>
              <TableColumn key="dietaryRequirements" allowsSorting>
                Has Dietary Requirements?
              </TableColumn>
              <TableColumn key="extraInfo" allowsSorting>
                Has Extra Info?
              </TableColumn>
            </TableHeader>
            <TableBody>
              {guestRSVPs.map((rsvp) => (
                <TableRow
                  key={rsvp.guest.id}
                  onClick={() => handleRowClick(rsvp)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <TableCell>{rsvp.guest.name}</TableCell>
                  <TableCell>{getCheckmark(!!rsvp.rsvp?.id)}</TableCell>
                  <TableCell>{getCheckmark(rsvp.rsvp?.isAttending)}</TableCell>
                  <TableCell>
                    {getCheckmark(rsvp.rsvp?.dietaryRequirements)}
                  </TableCell>
                  <TableCell>{getCheckmark(rsvp.rsvp?.extraInfo)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {hasNextPage && (
            <Button onClick={() => fetchNextPage()} className="mt-4">
              Load More
            </Button>
          )}
        </>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit RSVP</ModalHeader>
              <ModalBody>
                {selectedRSVP && (
                  <RSVPEditForm
                    guestRSVP={selectedRSVP}
                    onSubmit={handleUpdateRSVP}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

interface RSVPEditFormProps {
  guestRSVP?: GuestRSVP;
  onSubmit: (rsvp: GuestRSVP) => void;
}

const RSVPEditForm: React.FC<RSVPEditFormProps> = ({ guestRSVP, onSubmit }) => {
  const [formData, setFormData] = useState<RSVP>(
    guestRSVP?.rsvp ?? {
      id: "",
      isAttending: false,
      dietaryRequirements: "",
      extraInfo: "",
      updatedAt: new Date(),
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    if (!guestRSVP?.guest) return;
    e.preventDefault();
    onSubmit({
      guest: guestRSVP?.guest,
      rsvp: formData,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | boolean,
    name?: string,
  ) => {
    if (typeof e === "boolean") {
      // Handle Switch change
      setFormData((prev) => ({
        ...prev,
        [name!]: e,
      }));
    } else {
      // Handle other input changes
      const { name, value, type } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <Switch
          name="isAttending"
          isSelected={formData.isAttending}
          onValueChange={(isSelected) =>
            handleChange(isSelected, "isAttending")
          }
        >
          Attending
        </Switch>
      </div>
      <div className="mb-4">
        <Textarea
          label="Dietary Requirements"
          name="dietaryRequirements"
          value={formData.dietaryRequirements}
          onChange={handleChange}
          className="w-full"
        />
      </div>
      <div className="mb-4">
        <Textarea
          label="Extra Info"
          name="extraInfo"
          value={formData.extraInfo}
          onChange={handleChange}
          className="w-full"
        />
      </div>
      <Button type="submit" color="primary">
        Update RSVP
      </Button>
    </form>
  );
};

export default RSVPPage;
