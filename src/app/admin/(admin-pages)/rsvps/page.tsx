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
  type SortDescriptor,
  Card,
  CardBody,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import {
  type GuestRSVP,
  type RSVP,
  type SortField,
  useRSVPManagement,
} from "@/app/_hooks/useRSVPManagement";
import { CheckCircle, CircleHelp, XCircle } from "lucide-react";

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
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    filters,
    setFilters,
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

  const sortDescriptor: SortDescriptor = {
    column: sortField,
    direction: sortOrder === "asc" ? "ascending" : "descending",
  };
  const sort = (descriptor: SortDescriptor) => {
    if (descriptor.column && descriptor.direction) {
      setSortField(descriptor.column.toString() as SortField);
      setSortOrder(descriptor.direction === "ascending" ? "asc" : "desc");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Card>
        <CardBody className="flex flex-row gap-2">
          <Input
            placeholder="Search RSVPs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered">Filters</Button>
            </DropdownTrigger>
            <DropdownMenu closeOnSelect={false} selectionMode="none">
              {(
                [
                  ["Has RSVP?", "hasRSVP"],
                  ["Is Attending?", "isAttending"],
                  ["Has Dietary Requirements?", "hasDietaryRequirements"],
                  ["Has Extra Info?", "hasExtraInfo"],
                ] as const
              ).map(([text, field]) => (
                <DropdownItem
                  key={field}
                  endContent={
                    filters[field] === undefined ? (
                      <CircleHelp />
                    ) : filters[field] ? (
                      <CheckCircle />
                    ) : (
                      <XCircle />
                    )
                  }
                  onClick={() =>
                    setFilters((prev) => {
                      const currentValue = prev[field];
                      let newValue;

                      if (currentValue === undefined) {
                        newValue = true;
                      } else if (currentValue === true) {
                        newValue = false;
                      } else {
                        newValue = undefined;
                      }

                      return { ...prev, [field]: newValue };
                    })
                  }
                >
                  {text}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </CardBody>
      </Card>

      <Table
        aria-label="RSVP Table"
        onSortChange={sort}
        sortDescriptor={sortDescriptor}
      >
        <TableHeader>
          <TableColumn key="name" allowsSorting className="w-2/6">
            Name
          </TableColumn>
          <TableColumn key="updatedAt" allowsSorting className="w-1/6">
            Has RSVP?
          </TableColumn>
          <TableColumn key="isAttending" allowsSorting className="w-1/6">
            Attending?
          </TableColumn>
          <TableColumn
            key="dietaryRequirements"
            allowsSorting
            className="w-1/6"
          >
            Has Dietary Requirements?
          </TableColumn>
          <TableColumn key="extraInfo" allowsSorting className="w-1/6">
            Has Extra Info?
          </TableColumn>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5}>
                <div className="flex justify-center">
                  <Spinner />
                </div>
              </TableCell>
              <TableCell className="hidden"> </TableCell>
              <TableCell className="hidden"> </TableCell>
              <TableCell className="hidden"> </TableCell>
              <TableCell className="hidden"> </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={5}>
                <div>Error: {error.message}</div>
              </TableCell>
              <TableCell className="hidden"> </TableCell>
              <TableCell className="hidden"> </TableCell>
              <TableCell className="hidden"> </TableCell>
              <TableCell className="hidden"> </TableCell>
            </TableRow>
          ) : (
            guestRSVPs.map((rsvp) => (
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
            ))
          )}
        </TableBody>
      </Table>
      {!isLoading && !error && hasNextPage && (
        <Button onClick={() => fetchNextPage()} className="mt-4">
          Load More
        </Button>
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
