"use client";

import { api } from "@/trpc/react";
import { Button, Card, CardBody, Radio, RadioGroup } from "@nextui-org/react";
import React, { Fragment, lazy, Suspense, useEffect } from "react";
import toast from "react-hot-toast";
import { CirclePlusIcon, CircleStopIcon } from "lucide-react";
import ImagePicker from "./imagePicker";

const HTMLEditor = lazy(() => import("./HTMLEditor"));

const Shimmer = () => (
  <Card className="h-24 animate-pulse bg-gray-300">
    <CardBody></CardBody>
  </Card>
);

type layout = "TEXT" | "IMAGE_FIRST" | "IMAGE_LAST";

const ContentPieceEditor: React.FC<{
  contentPiece: {
    id: string;
    html: string;
    layout: layout;
    imageId?: string | null;
  };
  refetchParent: () => void;
}> = ({ contentPiece, refetchParent }) => {
  const [layout, setLayout] = React.useState(contentPiece.layout);
  const [imageId, setImageId] = React.useState(contentPiece.imageId);
  const [html, setHtml] = React.useState(contentPiece.html);

  const { mutate: update } = api.content.updateContentPiece.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Saved");
      refetchParent();
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (
      contentPiece.html === html &&
      contentPiece.layout === layout &&
      contentPiece.imageId === imageId
    )
      return;
    update({
      id: contentPiece.id,
      html: html,
      layout,
      imageId,
    });
  }, [contentPiece, html, layout, imageId, update]);

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <HTMLEditor
          onSave={async (data: string) => {
            setHtml(data);
          }}
          initialData={html}
        />
        <div>
          <h3 className="text-lg">Pick layout</h3>
          <RadioGroup
            orientation="horizontal"
            value={layout}
            onValueChange={(value) => {
              setLayout(value as layout);
            }}
          >
            <Radio value="TEXT">Text</Radio>
            <Radio value="IMAGE_FIRST">Image first</Radio>
            <Radio value="IMAGE_LAST">Image last</Radio>
          </RadioGroup>
        </div>
        {layout !== "TEXT" && (
          <ImagePicker imageId={imageId} setImageId={setImageId} />
        )}
      </CardBody>
    </Card>
  );
};

interface ContentEditorProps {
  slug: string;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ slug }) => {
  const { data, refetch } = api.content.getContentBySlug.useQuery({ slug }, {});
  const ContentPieces = data?.ContentPieces ?? [];

  const commonMutationOptions = {
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
    onSettled: async () => {
      await refetch();
    },
  };
  const { mutate: pushContentPiece } = api.content.pushContentPiece.useMutation(
    { ...commonMutationOptions },
  );
  const { mutate: popContentPiece } = api.content.popContentPiece.useMutation({
    ...commonMutationOptions,
  });

  if (!data) {
    return <Shimmer />;
  }
  return (
    <Fragment>
      {ContentPieces.map((contentPiece) => (
        <Suspense key={contentPiece.id} fallback={<Shimmer />}>
          <ContentPieceEditor
            contentPiece={contentPiece}
            refetchParent={refetch}
          />
        </Suspense>
      ))}
      <div className="flex w-full items-center justify-center gap-3">
        <Button
          isIconOnly
          color="primary"
          onClick={() => pushContentPiece({ contentId: data.id })}
        >
          <CirclePlusIcon />
        </Button>
        <Button
          isIconOnly
          color="danger"
          isDisabled={ContentPieces.length < 2}
          onClick={() => popContentPiece({ contentId: data.id })}
        >
          <CircleStopIcon />
        </Button>
      </div>
    </Fragment>
  );
};

export default ContentEditor;
