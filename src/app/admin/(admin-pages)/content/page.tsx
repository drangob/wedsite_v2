"use client";
import { api } from "@/trpc/react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";

import React from "react";
import NewContentModal from "./NewContentModal";
import DeleteContentModal from "./DeleteContentModal";
import ContentEditor from "./contentEditor";

export default function Content() {
  const [newContentModalOpen, setNewContentModalOpen] = React.useState(false);
  const [deleteContentModalOpen, setDeleteContentModalOpen] =
    React.useState(false);
  const [selectedSlug, setSelectedSlug] = React.useState<string>();
  const [selectedProtected, setSelectedProtected] =
    React.useState<boolean>(false);

  const { data: contents = [], refetch: refetchSlugs } =
    api.content.getAllContentInfo.useQuery();

  const onSelectionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = e.target?.value;
    if (!selectedOption) {
      return;
    }
    setSelectedSlug(selectedOption);
    setSelectedProtected(
      contents.find((c) => c.slug === selectedOption)!.protected,
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold">Content</h1>
        </CardHeader>
        <CardBody>
          <p>
            Here you will be able to view and edit the content of the website.
          </p>
        </CardBody>
        <CardFooter className="gap-1">
          <Select
            aria-label="Content"
            onChange={onSelectionChange}
            selectedKeys={selectedSlug && [selectedSlug]}
          >
            {contents?.map(({ slug, title }) => (
              <SelectItem key={slug} value={slug}>
                {title}
              </SelectItem>
            ))}
          </Select>
          <Button color="primary" onClick={() => setNewContentModalOpen(true)}>
            New
          </Button>
          <Button
            color="danger"
            isDisabled={!selectedSlug || selectedProtected}
            onClick={() => setDeleteContentModalOpen(true)}
          >
            Delete
          </Button>
        </CardFooter>
      </Card>

      {selectedSlug && <ContentEditor slug={selectedSlug} />}

      <NewContentModal
        isOpen={newContentModalOpen}
        onClose={async () => {
          await refetchSlugs();
          setNewContentModalOpen(false);
        }}
      />
      <DeleteContentModal
        isOpen={deleteContentModalOpen}
        onClose={async () => {
          await refetchSlugs();
          setDeleteContentModalOpen(false);
        }}
        selectedSlug={selectedSlug!}
        setSelectedSlug={setSelectedSlug}
      />
    </div>
  );
}
