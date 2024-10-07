/* eslint-disable @next/next/no-img-element */
"use client";

import { api } from "@/trpc/react";
import React, { Fragment } from "react";

import { type HTMLAttributes } from "react";

interface ContentPieceProps {
  piece: {
    id: string;
    html: string;
    layout: "TEXT" | "IMAGE_FIRST" | "IMAGE_LAST";
    image?: string;
  };
}

const ContentPiece: React.FC<ContentPieceProps> = ({ piece }) => {
  const image = (
    <img
      alt="decorative"
      src={
        piece.image ??
        "https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp"
      }
      className="w-full"
    />
  );
  return (
    <div className="flex w-full max-w-screen-lg items-center gap-8 px-4 py-8">
      {piece.layout === "IMAGE_FIRST" && image}
      <div dangerouslySetInnerHTML={{ __html: piece.html }} />
      {piece.layout === "IMAGE_LAST" && image}
    </div>
  );
};

interface ContentProps extends HTMLAttributes<HTMLDivElement> {
  slug: string;
}

const Content = ({ slug }: ContentProps) => {
  const { data } = api.content.getContentBySlug.useQuery({
    slug,
  });

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
