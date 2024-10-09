"use client";

import { api } from "@/trpc/react";
import {
  Button,
  Card,
  CardBody,
  Radio,
  RadioGroup,
  type CardProps,
} from "@nextui-org/react";
import React, { Fragment, lazy, Suspense, useEffect } from "react";
import toast from "react-hot-toast";
import { CirclePlusIcon, CircleStopIcon } from "lucide-react";
import ImagePicker from "./imagePicker";

import { type Group } from "@prisma/client";

const HTMLEditor = lazy(() => import("./HTMLEditor"));

interface GroupPickerProps extends CardProps {
  setGroup: (group: Group | null) => void;
  group: Group | null;
  isDisabled?: boolean;
}

const GroupPicker: React.FC<GroupPickerProps> = ({
  setGroup,
  group,
  isDisabled,
  ...props
}) => {
  return (
    <Card {...props}>
      <CardBody>
        <h3 className="text-lg">Pick group</h3>
        <RadioGroup
          orientation="horizontal"
          value={group ?? ""}
          onValueChange={(value) => {
            if (value === "") {
              setGroup(null);
            } else {
              setGroup(value as Group);
            }
          }}
          isDisabled={isDisabled}
        >
          <Radio value="">No</Radio>
          <Radio value="DAY">Day</Radio>
          <Radio value="EVENING">Evening</Radio>
        </RadioGroup>
      </CardBody>
    </Card>
  );
};

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
    group: string | null;
  };
  refetchParent: () => void;
  parentGroup: string | null;
}> = ({ contentPiece, refetchParent, parentGroup }) => {
  const [layout, setLayout] = React.useState(contentPiece.layout);
  const [imageId, setImageId] = React.useState(contentPiece.imageId);
  const [html, setHtml] = React.useState(contentPiece.html);
  const [group, setGroup] = React.useState<Group | null>(
    (contentPiece.group as Group) || null,
  );

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
      contentPiece.imageId === imageId &&
      contentPiece.group === group
    )
      return;
    update({
      id: contentPiece.id,
      html: html,
      layout,
      imageId,
      group: group,
    });
  }, [contentPiece, html, layout, imageId, update, group]);

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <HTMLEditor
          onSave={async (data: string) => {
            setHtml(data);
          }}
          initialData={html}
        />
        <GroupPicker
          group={group}
          setGroup={setGroup}
          shadow="none"
          className={
            parentGroup !== group && group !== null ? "bg-red-200" : ""
          }
        />
        <Card shadow="none">
          <CardBody>
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
          </CardBody>
        </Card>
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
  const { mutate: updateContent } = api.content.updateContent.useMutation(
    commonMutationOptions,
  );

  const [group, setGroup] = React.useState<Group | null>(data?.group ?? null);

  useEffect(() => {
    if (data?.group !== group) {
      setGroup(data?.group ?? null);
    }
  }, [data, group]);

  if (!data) {
    return <Shimmer />;
  }
  return (
    <Fragment>
      {!data.protected && (
        <GroupPicker
          setGroup={(g) => {
            setGroup(g);
            updateContent({ ...data, group: g });
          }}
          group={group}
          isDisabled={data.protected}
        />
      )}
      {ContentPieces.map((contentPiece) => (
        <Suspense key={contentPiece.id} fallback={<Shimmer />}>
          <ContentPieceEditor
            contentPiece={contentPiece}
            refetchParent={refetch}
            parentGroup={group}
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
