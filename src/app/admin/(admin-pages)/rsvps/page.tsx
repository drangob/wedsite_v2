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
import { CheckCircle, CircleHelp, Download, XCircle } from "lucide-react";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";

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
    rsvpCount,
    dietaryRequirementsCount,
    extraInfoCount,
    allUsersCount,
    totalGuestsCount,
    attendingGuestCount,
    saveCSV,
  } = useRSVPManagement();
  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: hasNextPage,
    onLoadMore: fetchNextPage as () => void,
  });

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
      <Card>
        <CardBody className="flex flex-row items-center justify-between gap-2">
          <div>
            RSVPs received: {rsvpCount}/{allUsersCount}
          </div>
          <div>
            Attending: {attendingGuestCount}/{totalGuestsCount}
          </div>
          <div>Dietary Reqs: {dietaryRequirementsCount}</div>
          <div>Extra Info given: {extraInfoCount}</div>
          <Button isIconOnly onClick={saveCSV}>
            <Download />
          </Button>
        </CardBody>
      </Card>
      <Card></Card>

      <Table
        aria-label="RSVP Table"
        onSortChange={sort}
        sortDescriptor={sortDescriptor}
        baseRef={scrollerRef}
        bottomContent={
          hasNextPage && <Spinner ref={loaderRef} label="Loading more..." />
        }
        className="max-h-[82vh] min-w-full"
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
                <TableCell className="flex flex-row gap-4">
                  {rsvp.rsvp ? (
                    <>
                      {getCheckmark(
                        (rsvp.rsvp.attendingGuestNames.length ?? 0) > 0,
                      )}
                      {rsvp.rsvp.attendingGuestNames.length}/
                      {rsvp.guest.guestNames.length}
                    </>
                  ) : null}
                </TableCell>

                <TableCell>
                  {getCheckmark(rsvp.rsvp?.dietaryRequirements)}
                </TableCell>
                <TableCell>{getCheckmark(rsvp.rsvp?.extraInfo)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
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
      guestNames: [],
      attendingGuestNames: guestRSVP?.guest.guestNames ?? [],
      nonAttendingGuestNames: [],
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    // Handle other input changes
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 flex flex-col gap-4">
        {guestRSVP?.guest.guestNames.map((guestName) => (
          <Switch
            key={guestName}
            isSelected={formData.attendingGuestNames.includes(guestName)}
            onValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                attendingGuestNames: value
                  ? [...prev.attendingGuestNames, guestName]
                  : prev.attendingGuestNames.filter(
                      (name) => name !== guestName,
                    ),
                nonAttendingGuestNames: value
                  ? prev.nonAttendingGuestNames.filter(
                      (name) => name !== guestName,
                    )
                  : [...prev.nonAttendingGuestNames, guestName],
              }));
            }}
          >
            {guestName}
          </Switch>
        ))}
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
