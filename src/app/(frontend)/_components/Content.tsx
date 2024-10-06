"use client";

import { api } from "@/trpc/react";
import React from "react";

import { type HTMLAttributes } from "react";

interface ContentCardProps extends HTMLAttributes<HTMLDivElement> {
  slug: string;
}

const Content = ({ slug, ...props }: ContentCardProps) => {
  const { data, error } = api.content.getContentBySlug.useQuery({
    slug,
  });

  const html = !error ? data?.html : `Error loading content '${slug}'`;

  if (!html) {
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
    <div
      className="w-full max-w-screen-lg px-4 py-8"
      {...props}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
export default Content;
