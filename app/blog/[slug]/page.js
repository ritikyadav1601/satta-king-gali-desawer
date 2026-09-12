import { notFound } from "next/navigation";
import BlogBody from "@/components/BlogBody";
import PublicLayout from "@/components/PublicLayout";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import { CURRENT_SITE, POST_QUERY } from "@/sanity/lib/queries";
import { siteUrl } from "@/lib/site";

export const revalidate = 60;

async function getPost(slug) {
  return sanityFetch({
    query: POST_QUERY,
    params: { site: CURRENT_SITE, slug },
    fallback: null
  });
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const coverUrl = urlForImage(post.coverImage)?.width(1200).height(630).fit("crop").url();
  const canonical = `${siteUrl}/blog/${post.slug}`;

  return {
    title: { absolute: post.metaTitle || post.title },
    description: post.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription,
      type: "article",
      url: canonical,
      publishedTime: post.publishedAt,
      images: coverUrl ? [{ url: coverUrl, alt: post.coverImage?.alt || post.title }] : []
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle || post.title,
      description: post.metaDescription,
      images: coverUrl ? [coverUrl] : []
    }
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const coverUrl = urlForImage(post.coverImage)
    ?.width(1200)
    .height(675)
    .fit("crop")
    .auto("format")
    .url();

  return (
    <PublicLayout>
      <main className="blog-post-container">
        <article className="blog-post">
          <header>
            <p className="blog-date">
              {new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(
                new Date(post.publishedAt)
              )}
            </p>
            <h1>{post.title}</h1>
          </header>
          {coverUrl && (
            <img
              className="blog-cover-image"
              src={coverUrl}
              alt={post.coverImage?.alt || post.title}
            />
          )}
          <div className="blog-body">
            <BlogBody value={post.content} />
          </div>
        </article>
      </main>
    </PublicLayout>
  );
}
