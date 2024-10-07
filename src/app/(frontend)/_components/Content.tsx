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
    imageUrl?: string | null;
  };
}

const ContentPiece: React.FC<ContentPieceProps> = ({ piece }) => {
  const image = piece.imageUrl ? (
    <img alt="decorative" src={piece.imageUrl} className="w-full sm:w-1/2" />
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
