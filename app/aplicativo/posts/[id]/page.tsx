import { notFound } from "next/navigation";
import { postsImagens } from "../../posts";
import PostDetail from "./post-detail";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = postsImagens.find((item) => item.id === id);

  if (!post) notFound();

  return <PostDetail post={post} />;
}
