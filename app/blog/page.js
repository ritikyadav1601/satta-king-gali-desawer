import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import { isSanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import { CURRENT_SITE, POSTS_QUERY } from "@/sanity/lib/queries";
import { siteUrl } from "@/lib/site";

export const revalidate = 60;

export const metadata = {
  title: "Blog",
  description: "Read the latest Satta King Gali Disawar articles, guides and market information.",
  alternates: { canonical: `${siteUrl}/blog` }
};

export default async function BlogPage() {
  const posts = await sanityFetch({
    query: POSTS_QUERY,
    params: { site: CURRENT_SITE },
    fallback: []
  });

  return (
    <PublicLayout>
      <main className="blog-container">
        <header className="blog-page-header">
          <h1>Latest Blog Posts</h1>
          <p>Articles and useful information from Satta King Gali Disawar.</p>
        </header>

        {!isSanityConfigured && (
          <div className="blog-empty">
            Sanity is ready but not connected. Add the project ID and dataset to your environment to
            display published posts.
          </div>
        )}

        {isSanityConfigured && posts.length === 0 && (
          <div className="blog-empty">No blog posts have been published for this site yet.</div>
        )}

        <div className="blog-grid">
          {posts.map((post) => {
            const coverUrl = urlForImage(post.coverImage)
              ?.width(720)
              .height(405)
              .fit("crop")
              .auto("format")
              .url();

            return (
              <article className="blog-card" key={post._id}>
                {coverUrl && (
                  <Link href={`/blog/${post.slug}`} tabIndex={-1}>
                    <img
                      className="blog-card-image"
                      src={coverUrl}
                      alt={post.coverImage?.alt || post.title}
                      loading="lazy"
                    />
                  </Link>
                )}
                <div className="blog-card-content">
                  <p className="blog-date">
                    {post.publishedAt
                      ? new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(
                          new Date(post.publishedAt)
                        )
                      : ""}
                  </p>
                  <h2>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  {post.metaDescription && <p>{post.metaDescription}</p>}
                  <Link className="blog-read-more" href={`/blog/${post.slug}`}>
                    Read article →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </PublicLayout>
  );
}
