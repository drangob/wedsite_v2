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
  Spinner,
} from "@nextui-org/react";

const HTMLEditor = lazy(() => import("./HTMLEditor"));

import React, { lazy, Suspense } from "react";
import toast from "react-hot-toast";
import NewContentModal from "./NewContentModal";
import DeleteContentModal from "./DeleteContentModal";

interface Content {
  id: string;
  slug: string;
  html: string;
}

export default function Content() {
  const [newContentModalOpen, setNewContentModalOpen] = React.useState(false);
  const [deleteContentModalOpen, setDeleteContentModalOpen] =
    React.useState(false);
  const { data: contentSlugs = [], refetch: refetchSlugs } =
    api.content.getAllContentSlugs.useQuery();
  const [selectedSlug, setSelectedSlug] = React.useState<string>();
  const updateContentMutation = api.content.updateContent.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const {
    data: fetchedContent,
    refetch,
    isLoading: contentLoading,
    isRefetching: contentRefetching,
  } = api.content.getContentBySlug.useQuery(
    { slug: selectedSlug! },
    { enabled: false }, // This prevents the query from running automatically
  );

  const loading = contentLoading || contentRefetching;

  React.useEffect(() => {
    if (selectedSlug) {
      refetch()
        .then()
        .catch((e) => {
          console.log(e);
        });
    }
  }, [selectedSlug, refetch]);

  if (!contentSlugs || contentSlugs.length === 0) {
    return <Spinner />;
  }

  const onSelectionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = e.target?.value;
    if (!selectedOption) {
      return;
    }
    setSelectedSlug(selectedOption);
  };

  const onSave = async (data: string) => {
    if (!fetchedContent) return;
    const saving = toast.loading("Saving...");

    updateContentMutation.mutate({
      id: fetchedContent?.id,
      slug: fetchedContent?.slug,
      html: data,
    });
    toast.dismiss(saving);
    toast.success("Saved");
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
            {contentSlugs?.map((slug) => (
              <SelectItem key={slug} value={slug}>
                {slug}
              </SelectItem>
            ))}
          </Select>
          <Button color="primary" onClick={() => setNewContentModalOpen(true)}>
            New
          </Button>
          <Button
            color="danger"
            disabled={!selectedSlug && !loading}
            onClick={() => setDeleteContentModalOpen(true)}
          >
            Delete
          </Button>
        </CardFooter>
      </Card>
      {selectedSlug && (
        <Card>
          <CardBody>
            {loading ? (
              <Spinner />
            ) : (
              fetchedContent && (
                <Suspense fallback={<Spinner />}>
                  <HTMLEditor
                    onSave={onSave}
                    initialData={fetchedContent?.html}
                  />
                </Suspense>
              )
            )}
          </CardBody>
        </Card>
      )}
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
