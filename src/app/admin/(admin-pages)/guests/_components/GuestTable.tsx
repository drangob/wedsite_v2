import { type Key } from "react";
import {
  Button,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import { type Guest } from "../../../../_hooks/useGuestsManagement";

type GuestsTableProps = {
  guests: Guest[];
  isLoading: boolean;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  hasNextPage: boolean;
  fetchNextPage: () => void;
};

const GuestsTable = ({
  guests,
  isLoading,
  onEdit,
  onDelete,
  hasNextPage,
  fetchNextPage,
}: GuestsTableProps) => {
  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: hasNextPage,
    onLoadMore: fetchNextPage,
  });

  const columns = [
    { key: "name", label: "Name", width: "w-1/4" },
    { key: "email", label: "Email", width: "w-1/2" },
    { key: "group", label: "Group", width: "w-1/8" },
    { key: "actions", label: "Actions", width: "w-1/8" },
  ];

  const rows = guests.map((guest) => ({
    key: guest.id,
    name: guest.name,
    email: guest.email,
    group: guest.group,
    actions: (
      <div>
        <Button size="sm" color="primary" onPress={() => onEdit(guest)}>
          Edit
        </Button>
        <Button size="sm" color="danger" onPress={() => onDelete(guest)}>
          Delete
        </Button>
      </div>
    ),
  }));

  type GuestRowItem = (typeof rows)[0];

  return (
    <Table
      aria-label="Guests table"
      className="max-h-[85vh] min-w-full"
      baseRef={scrollerRef}
      bottomContent={
        hasNextPage && <Spinner ref={loaderRef} label="Loading more..." />
      }
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.key} className={column.width}>
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={rows}
        isLoading={isLoading}
        loadingContent={<Spinner label="Loading..." />}
      >
        {(item: GuestRowItem) => (
          <TableRow key={item.key}>
            {(columnKey: Key) => (
              <TableCell>{item[columnKey as keyof GuestRowItem]}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default GuestsTable;
