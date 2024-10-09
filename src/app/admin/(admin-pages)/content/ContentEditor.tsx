"use client";

import { api } from "@/trpc/react";
import { Button } from "@nextui-org/react";
import React, { Fragment, Suspense, useEffect } from "react";
import toast from "react-hot-toast";
import { CirclePlusIcon, CircleStopIcon } from "lucide-react";
import GroupPicker from "./_components/GroupPicker";

import { type Group } from "@prisma/client";
import Shimmer from "./_components/Shimmer";
import ContentPieceEditor from "./ContentPieceEditor";

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
