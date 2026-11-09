import { postsImagens } from "../../../../aplicativo/posts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const post = postsImagens.find((item) => item.id === id);
  if (!post) return new Response("Image not found", { status: 404 });

  try {
    const imageResponse = await fetch(post.imagem, { cache: "no-store" });
    const contentType = imageResponse.headers.get("content-type") ?? "";
    if (!imageResponse.ok || !contentType.startsWith("image/")) {
      return new Response("Image unavailable", { status: 502 });
    }

    return new Response(await imageResponse.arrayBuffer(), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Image unavailable", { status: 502 });
  }
}
