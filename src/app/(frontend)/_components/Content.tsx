/* eslint-disable @next/next/no-img-element */
"use client";

import { api } from "@/trpc/react";
import Image from "next/image";
import React, { Fragment } from "react";

import { type HTMLAttributes } from "react";

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#ddd" offset="20%" />
      <stop stop-color="#eee" offset="50%" />
      <stop stop-color="#ddd" offset="70%" />
    </linearGradient>
    <clipPath id="rounded">
      <rect width="${w}" height="${h}" rx="15" ry="15" />
    </clipPath>
  </defs>
  <rect width="${w}" height="${h}" fill="#ddd" clip-path="url(#rounded)" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" clip-path="url(#rounded)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

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
    <Image
      alt=""
      width={800}
      height={800}
      sizes="(max-width: 640px) 100vw, 50vw"
      src={piece.imageUrl}
      className="w-full sm:w-1/2"
      placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(800, 800))}`}
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
