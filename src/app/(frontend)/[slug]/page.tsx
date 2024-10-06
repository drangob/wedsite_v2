import { notFound } from "next/navigation";
import Content from "../_components/Content";
import { api } from "@/trpc/server";

interface ContentPageProps {
  params: { slug: string };
}

const ContentPage: React.FC<ContentPageProps> = async ({ params }) => {
  // check that the slug is valid
  const slugExists = await api.content.contentExists({ slug: params.slug });
  if (!slugExists) {
    notFound();
  }
  return (
    <div className="flex flex-col items-center">
      <Content slug={params.slug} />
    </div>
  );
};

export default ContentPage;
