import React, { useEffect } from "react";
import { Card, CardBody, Radio, RadioGroup } from "@nextui-org/react";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import { type Group } from "@prisma/client";
import GroupPicker from "./_components/GroupPicker";
import ImagePicker from "./_components/ImagePicker";

const HTMLEditor = React.lazy(() => import("./_components/HTMLEditor"));

type layout = "TEXT" | "IMAGE_FIRST" | "IMAGE_LAST";

interface ContentPieceEditorProps {
  contentPiece: {
    id: string;
    html: string;
    layout: layout;
    imageId?: string | null;
    group: string | null;
  };
  refetchParent: () => void;
  parentGroup: string | null;
}

const ContentPieceEditor: React.FC<ContentPieceEditorProps> = ({
  contentPiece,
  refetchParent,
  parentGroup,
}) => {
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
        <div className="flex flex-col justify-between sm:flex-row">
          <div>
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
          </div>
          <div>
            {layout !== "TEXT" && (
              <ImagePicker imageId={imageId} setImageId={setImageId} />
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ContentPieceEditor;
