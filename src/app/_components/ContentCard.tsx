"use client";

import { api } from "@/trpc/react";
import { Card, CardBody, type CardProps, Spinner } from "@nextui-org/react";
import React from "react";

interface ContentCardProps extends CardProps {
  slug: string;
}

const ContentCard = ({ slug, ...props }: ContentCardProps) => {
  const { data, error } = api.content.getContentBySlug.useQuery({
    slug,
  });

  const html = !error ? data?.html : `Error loading content '${slug}'`;

  return (
    <Card {...props}>
      <CardBody>
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <Spinner />
        )}
      </CardBody>
    </Card>
  );
};
export default ContentCard;
