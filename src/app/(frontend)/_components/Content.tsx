/* eslint-disable @next/next/no-img-element */
import { api } from "@/trpc/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { type HTMLAttributes, Fragment } from "react";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";

type ContentOutput =
  inferRouterOutputs<AppRouter>["content"]["getContentBySlug"];

interface ContentPieceProps {
  piece: ContentOutput["ContentPieces"][number];
}

const ContentPiece: React.FC<ContentPieceProps> = ({ piece }) => {
  const image = piece.imageUrl ? (
    <Image
      alt=""
      width={800}
      height={800}
      sizes="(max-width: 640px) 100vw, 50vw"
      src={piece.imageUrl}
      className="w-full sm:w-1/2"
    />
  ) : (
    <div className="h-64 w-full bg-gray-300 sm:w-1/2"></div>
  );
  return (
    <div className="flex w-full max-w-screen-lg flex-col items-center gap-8 px-4 py-8 sm:flex-row">
      {piece.layout === "IMAGE_FIRST" && image}
      <div
        dangerouslySetInnerHTML={{ __html: piece.html }}
        className={`w-full sm:${piece.layout !== "TEXT" ? "w-1/2" : "w-full"}`}
      />
      {piece.layout === "IMAGE_LAST" && image}
    </div>
  );
};

interface ContentProps extends HTMLAttributes<HTMLDivElement> {
  slug: string;
}

const Content = async ({ slug }: ContentProps) => {
  let data: ContentOutput;
  try {
    data = await api.content.getContentBySlug({
      slug,
    });
  } catch (error) {
    return notFound();
  }

  const pieces = data?.ContentPieces ?? [];

  if (!pieces.length) {
    return (
      <div className="w-full max-w-screen-lg px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-80 rounded-xl bg-gray-300"></div>
          <div className="mb-4 h-4 rounded-xl bg-gray-300"></div>
          <div className="mb-4 h-4 rounded-xl bg-gray-300"></div>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      {pieces.map((piece) => (
        <ContentPiece key={piece.id} piece={piece} />
      ))}
    </Fragment>
  );
};
export default Content;
